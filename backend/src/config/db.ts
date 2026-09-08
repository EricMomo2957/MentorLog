import mysql from 'mysql2/promise';
import { Pool as PgPool, QueryResult } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Determine if we should use PostgreSQL (via DATABASE_URL or DB_TYPE=postgres)
const databaseUrl = process.env.DATABASE_URL || '';
const isPostgres = databaseUrl.startsWith('postgres://') || databaseUrl.startsWith('postgresql://') || process.env.DB_TYPE === 'postgres';

let pgPool: PgPool | null = null;
let mysqlPool: mysql.Pool | null = null;

if (isPostgres) {
    console.log("🐘 Initializing PostgreSQL Connection Pool (Neon/Cloud)...");
    pgPool = new PgPool({
        connectionString: databaseUrl,
        ssl: databaseUrl.includes('localhost') ? false : { rejectUnauthorized: false },
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000
    });

    pgPool.on('error', (err) => {
        console.error('❌ Unexpected PostgreSQL error on idle client:', err);
    });
} else {
    console.log("🐬 Initializing MySQL Connection Pool (XAMPP/Local)...");
    mysqlPool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'mentorlog_db',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });
}

/**
 * Normalizes SQL queries and parameter placeholders between MySQL and PostgreSQL
 */
function normalizeQueryForPostgres(sql: string): { normalizedSql: string; isInsert: boolean } {
    let paramIndex = 1;
    let inSingleQuote = false;
    let inDoubleQuote = false;
    let normalizedSql = '';
    const isInsert = /^\s*insert\s+into/i.test(sql);

    for (let i = 0; i < sql.length; i++) {
        const char = sql[i];
        const prevChar = i > 0 ? sql[i - 1] : '';

        if (char === "'" && prevChar !== '\\') {
            inSingleQuote = !inSingleQuote;
            normalizedSql += char;
        } else if (char === '"' && !inSingleQuote) {
            // Convert MySQL double quotes around string literals to single quotes
            normalizedSql += "'";
            inDoubleQuote = !inDoubleQuote;
        } else if (char === '?' && !inSingleQuote && !inDoubleQuote) {
            normalizedSql += `$${paramIndex++}`;
        } else {
            normalizedSql += char;
        }
    }

    // Convert MySQL-specific functions
    normalizedSql = normalizedSql.replace(/TIMESTAMPDIFF\(HOUR,\s*([a-zA-Z0-9_.]+),\s*([a-zA-Z0-9_.]+)\)/gi, 'EXTRACT(EPOCH FROM ($2 - $1))/3600');
    normalizedSql = normalizedSql.replace(/CURDATE\(\)/gi, 'CURRENT_DATE');
    normalizedSql = normalizedSql.replace(/NOW\(\)/gi, 'CURRENT_TIMESTAMP');
    normalizedSql = normalizedSql.replace(/DATE_ADD\(([^,]+),\s*INTERVAL\s+(\d+)\s+DAY\)/gi, "($1 + INTERVAL '$2 days')");

    // Normalize boolean comparisons for PostgreSQL
    normalizedSql = normalizedSql.replace(/\bis_active\s*=\s*1\b/gi, 'is_active = true');
    normalizedSql = normalizedSql.replace(/\bis_active\s*=\s*0\b/gi, 'is_active = false');
    normalizedSql = normalizedSql.replace(/\bis_read\s*=\s*1\b/gi, 'is_read = true');
    normalizedSql = normalizedSql.replace(/\bis_read\s*=\s*0\b/gi, 'is_read = false');
    normalizedSql = normalizedSql.replace(/\bis_used\s*=\s*1\b/gi, 'is_used = true');
    normalizedSql = normalizedSql.replace(/\bis_used\s*=\s*0\b/gi, 'is_used = false');
    normalizedSql = normalizedSql.replace(/\bis_used\s*=\s*FALSE\b/gi, 'is_used = false');
    normalizedSql = normalizedSql.replace(/\bis_used\s*=\s*TRUE\b/gi, 'is_used = true');

    // For INSERT statements, append RETURNING id if not already returning
    if (isInsert && !/returning\s+/i.test(normalizedSql)) {
        normalizedSql = normalizedSql.trim().replace(/;$/, '') + ' RETURNING id';
    }

    return { normalizedSql, isInsert };
}

/**
 * Universal Database Adapter Interface
 */
class UniversalDbPool {
    async query<T = any>(sql: string, params: any[] = []): Promise<[T, any]> {
        if (isPostgres && pgPool) {
            const { normalizedSql, isInsert } = normalizeQueryForPostgres(sql);
            const flatParams = Array.isArray(params) ? params : [];
            const result: QueryResult = await pgPool.query(normalizedSql, flatParams);

            if (isInsert) {
                const insertId = result.rows[0]?.id || (result.rowCount ? 1 : 0);
                const mockResult: any = {
                    insertId,
                    affectedRows: result.rowCount,
                    rows: result.rows
                };
                return [mockResult as T, result.fields];
            }

            if (/^\s*(update|delete)\s+/i.test(sql)) {
                const mockResult: any = {
                    affectedRows: result.rowCount,
                    rows: result.rows
                };
                return [mockResult as T, result.fields];
            }

            return [result.rows as T, result.fields];
        } else if (mysqlPool) {
            return await mysqlPool.query(sql, params) as any;
        }
        throw new Error("No database pool initialized.");
    }

    async execute<T = any>(sql: string, params: any[] = []): Promise<[T, any]> {
        return this.query<T>(sql, params);
    }
}

const pool = new UniversalDbPool();

export const runSchemaMigrations = async (): Promise<void> => {
    try {
        if (isPostgres && pgPool) {
            // PostgreSQL column additions & tables
            await pgPool.query(`
                ALTER TABLE attendance ADD COLUMN IF NOT EXISTS approval_status VARCHAR(20) DEFAULT 'Approved';
                ALTER TABLE attendance ADD COLUMN IF NOT EXISTS admin_remarks TEXT DEFAULT NULL;
                ALTER TABLE tasks ADD COLUMN IF NOT EXISTS proof_link VARCHAR(500) DEFAULT NULL;
                ALTER TABLE tasks ADD COLUMN IF NOT EXISTS proof_file_url VARCHAR(500) DEFAULT NULL;
                ALTER TABLE tasks ADD COLUMN IF NOT EXISTS submission_notes TEXT DEFAULT NULL;
                ALTER TABLE tasks ADD COLUMN IF NOT EXISTS verified_by_mentor BOOLEAN DEFAULT FALSE;
                ALTER TABLE users ADD COLUMN IF NOT EXISTS supervisor_signature TEXT DEFAULT NULL;
                ALTER TABLE users ADD COLUMN IF NOT EXISTS supervisor_name VARCHAR(255) DEFAULT NULL;
                ALTER TABLE users ADD COLUMN IF NOT EXISTS supervisor_designation VARCHAR(255) DEFAULT NULL;
                ALTER TABLE users ADD COLUMN IF NOT EXISTS supervisor_email VARCHAR(255) DEFAULT NULL;
                ALTER TABLE users ADD COLUMN IF NOT EXISTS supervisor_phone VARCHAR(50) DEFAULT NULL;
                ALTER TABLE users ADD COLUMN IF NOT EXISTS supervisor_department VARCHAR(255) DEFAULT NULL;
                ALTER TABLE users ADD COLUMN IF NOT EXISTS emergency_contact_name VARCHAR(255) DEFAULT NULL;
                ALTER TABLE users ADD COLUMN IF NOT EXISTS emergency_contact_relationship VARCHAR(100) DEFAULT NULL;
                ALTER TABLE users ADD COLUMN IF NOT EXISTS emergency_contact_phone VARCHAR(50) DEFAULT NULL;
                ALTER TABLE users ADD COLUMN IF NOT EXISTS emergency_contact_address TEXT DEFAULT NULL;
                ALTER TABLE document_submissions ADD COLUMN IF NOT EXISTS feedback TEXT DEFAULT NULL;
                ALTER TABLE document_submissions ADD COLUMN IF NOT EXISTS notes TEXT DEFAULT NULL;
                ALTER TABLE document_submissions ADD COLUMN IF NOT EXISTS original_name VARCHAR(255) DEFAULT NULL;

                CREATE TABLE IF NOT EXISTS weekly_journals (
                    id SERIAL PRIMARY KEY,
                    student_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    week_number INT NOT NULL,
                    start_date DATE NOT NULL,
                    end_date DATE NOT NULL,
                    total_hours_rendered NUMERIC(5,2) DEFAULT 0.00,
                    tasks_completed TEXT NOT NULL,
                    skills_acquired TEXT DEFAULT NULL,
                    challenges_and_solutions TEXT DEFAULT NULL,
                    plan_next_week TEXT DEFAULT NULL,
                    attachment_url VARCHAR(500) DEFAULT NULL,
                    status VARCHAR(30) DEFAULT 'Submitted',
                    mentor_feedback TEXT DEFAULT NULL,
                    mentor_rating INT DEFAULT NULL,
                    submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    reviewed_at TIMESTAMP DEFAULT NULL
                );
            `);
        } else if (mysqlPool) {
            // MySQL column additions (safe alter with try/catch)
            const safeAdd = async (table: string, colDef: string) => {
                try {
                    await mysqlPool!.query(`ALTER TABLE ${table} ADD COLUMN ${colDef}`);
                } catch (e: any) {
                    if (e.errno !== 1060 && !e.message?.includes('Duplicate column')) {
                        // ignore
                    }
                }
            };
            await safeAdd('attendance', 'approval_status VARCHAR(20) DEFAULT "Approved"');
            await safeAdd('attendance', 'admin_remarks TEXT DEFAULT NULL');
            await safeAdd('tasks', 'proof_link VARCHAR(500) DEFAULT NULL');
            await safeAdd('tasks', 'proof_file_url VARCHAR(500) DEFAULT NULL');
            await safeAdd('tasks', 'submission_notes TEXT DEFAULT NULL');
            await safeAdd('tasks', 'verified_by_mentor TINYINT(1) DEFAULT 0');
            await safeAdd('users', 'supervisor_signature TEXT DEFAULT NULL');
            await safeAdd('users', 'supervisor_name VARCHAR(255) DEFAULT NULL');
            await safeAdd('users', 'supervisor_designation VARCHAR(255) DEFAULT NULL');
            await safeAdd('users', 'supervisor_email VARCHAR(255) DEFAULT NULL');
            await safeAdd('users', 'supervisor_phone VARCHAR(50) DEFAULT NULL');
            await safeAdd('users', 'supervisor_department VARCHAR(255) DEFAULT NULL');
            await safeAdd('users', 'emergency_contact_name VARCHAR(255) DEFAULT NULL');
            await safeAdd('users', 'emergency_contact_relationship VARCHAR(100) DEFAULT NULL');
            await safeAdd('users', 'emergency_contact_phone VARCHAR(50) DEFAULT NULL');
            await safeAdd('users', 'emergency_contact_address TEXT DEFAULT NULL');
            await safeAdd('document_submissions', 'feedback TEXT DEFAULT NULL');
            await safeAdd('document_submissions', 'notes TEXT DEFAULT NULL');
            await safeAdd('document_submissions', 'original_name VARCHAR(255) DEFAULT NULL');

            try {
                await mysqlPool!.query(`
                    CREATE TABLE IF NOT EXISTS weekly_journals (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        student_id INT NOT NULL,
                        week_number INT NOT NULL,
                        start_date DATE NOT NULL,
                        end_date DATE NOT NULL,
                        total_hours_rendered DECIMAL(5,2) DEFAULT 0.00,
                        tasks_completed TEXT NOT NULL,
                        skills_acquired TEXT DEFAULT NULL,
                        challenges_and_solutions TEXT DEFAULT NULL,
                        plan_next_week TEXT DEFAULT NULL,
                        attachment_url VARCHAR(500) DEFAULT NULL,
                        status ENUM('Draft', 'Submitted', 'Approved', 'Needs Revision') DEFAULT 'Submitted',
                        mentor_feedback TEXT DEFAULT NULL,
                        mentor_rating INT DEFAULT NULL,
                        submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        reviewed_at TIMESTAMP NULL DEFAULT NULL,
                        INDEX (student_id),
                        CONSTRAINT fk_weekly_journals_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
                `);
            } catch (err) {
                // table creation ignore if exists
            }
        }
    } catch (err) {
        console.warn('Database schema auto-check notice:', err);
    }
};

/**
 * Health check ping to verify Database connection
 */
export const checkDbConnection = async (): Promise<boolean> => {
    try {
        if (isPostgres && pgPool) {
            const res = await pgPool.query('SELECT 1');
            await runSchemaMigrations();
            return !!res;
        } else if (mysqlPool) {
            await mysqlPool.query('SELECT 1');
            await runSchemaMigrations();
            return true;
        }
        return false;
    } catch (err) {
        console.error(`❌ ${isPostgres ? 'PostgreSQL' : 'MySQL'} Connection Ping Failed:`, err);
        return false;
    }
};

export default pool;