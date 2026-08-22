import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Create the connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'mentorlog_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Ensure tasks table has attachment_url and attachment_name columns
const initDb = async () => {
    try {
        await pool.query(`
            ALTER TABLE tasks 
            ADD COLUMN IF NOT EXISTS attachment_url VARCHAR(255) NULL,
            ADD COLUMN IF NOT EXISTS attachment_name VARCHAR(255) NULL
        `);
    } catch (err) {
        try {
            await pool.query(`ALTER TABLE tasks ADD COLUMN attachment_url VARCHAR(255) NULL`);
        } catch (_) {}
        try {
            await pool.query(`ALTER TABLE tasks ADD COLUMN attachment_name VARCHAR(255) NULL`);
        } catch (_) {}
    }

    // Safely add performance indexes for MySQL / XAMPP
    const addIndexSafe = async (tableName: string, indexName: string, columnsSql: string) => {
        try {
            await pool.query(`CREATE INDEX ${indexName} ON ${tableName} (${columnsSql})`);
        } catch (_) {}
    };

    await addIndexSafe('attendance', 'idx_attendance_user_date', 'user_id, date');
    await addIndexSafe('notifications', 'idx_notifications_user_read', 'user_id, is_read');
    await addIndexSafe('tasks', 'idx_tasks_user_status', 'user_id, status');
    await addIndexSafe('service_requests', 'idx_requests_student_status', 'student_id, status');
    await addIndexSafe('document_submissions', 'idx_docs_student_status', 'student_id, status');
};
initDb();

export default pool;