import db from './db';
import fs from 'fs';
import path from 'path';

/**
 * Helper to escape SQL values cleanly
 */
function formatSqlValue(val: any): string {
    if (val === null || val === undefined) {
        return 'NULL';
    }
    if (typeof val === 'number') {
        return `${val}`;
    }
    if (typeof val === 'boolean') {
        return val ? '1' : '0';
    }
    if (val instanceof Date) {
        const d = val.toISOString().slice(0, 19).replace('T', ' ');
        return `'${d}'`;
    }
    if (typeof val === 'object') {
        return `'${JSON.stringify(val).replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, function (char) {
            switch (char) {
                case "\0": return "\\0";
                case "\x08": return "\\b";
                case "\x09": return "\\t";
                case "\x1a": return "\\z";
                case "\n": return "\\n";
                case "\r": return "\\r";
                case "\"":
                case "'":
                case "\\":
                case "%":
                    return "\\" + char;
                default:
                    return char;
            }
        })}'`;
    }
    // String escaping
    const escaped = String(val).replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, function (char) {
        switch (char) {
            case "\0": return "\\0";
            case "\x08": return "\\b";
            case "\x09": return "\\t";
            case "\x1a": return "\\z";
            case "\n": return "\\n";
            case "\r": return "\\r";
            case "\"":
            case "'":
            case "\\":
            case "%":
                return "\\" + char;
            default:
                return char;
        }
    });
    return `'${escaped}'`;
}

export async function exportDatabaseToSeedsFile(outputPath?: string): Promise<void> {
    const targetPath = outputPath || path.join(__dirname, 'seeds.sql');
    console.log(`📦 Exporting real database records from mentorlog_db to: ${targetPath}`);

    const tableOrder = [
        'users',
        'tasks',
        'service_requests',
        'intern_questions',
        'question_replies',
        'password_resets',
        'feedbacks',
        'events',
        'document_submissions',
        'audit_logs',
        'attendance',
        'announcements',
        'admin_codes',
        'notifications',
        'email_verifications',
        'evaluations'
    ];

    let sqlOutput = `-- ==============================================================================\n`;
    sqlOutput += `-- MentorLog - Database Seed Data (Exported from Live mentorlog_db)\n`;
    sqlOutput += `-- Exported Date: ${new Date().toISOString()}\n`;
    sqlOutput += `-- ==============================================================================\n\n`;
    sqlOutput += `USE \`mentorlog_db\`;\n\n`;
    sqlOutput += `SET FOREIGN_KEY_CHECKS = 0;\n\n`;

    // Add truncate statements in reverse order
    for (let i = tableOrder.length - 1; i >= 0; i--) {
        sqlOutput += `TRUNCATE TABLE \`${tableOrder[i]}\`;\n`;
    }
    sqlOutput += `\nSET FOREIGN_KEY_CHECKS = 1;\n\n`;

    for (const table of tableOrder) {
        try {
            const [rows]: any = await db.query(`SELECT * FROM \`${table}\``);
            if (rows.length === 0) {
                sqlOutput += `-- No records found in \`${table}\`\n\n`;
                continue;
            }

            const columns = Object.keys(rows[0]).map(c => `\`${c}\``).join(', ');
            sqlOutput += `-- ------------------------------------------------------------------------------\n`;
            sqlOutput += `-- Table: \`${table}\` (${rows.length} records)\n`;
            sqlOutput += `-- ------------------------------------------------------------------------------\n`;
            sqlOutput += `INSERT INTO \`${table}\` (${columns}) VALUES\n`;

            const rowValues = rows.map((row: any) => {
                const values = Object.values(row).map(v => formatSqlValue(v)).join(', ');
                return `(${values})`;
            });

            sqlOutput += rowValues.join(',\n') + `;\n\n`;
            console.log(`✅ Exported ${rows.length} rows from \`${table}\``);
        } catch (e: any) {
            console.warn(`⚠️ Skipping table \`${table}\`: ${e.message}`);
        }
    }

    fs.writeFileSync(targetPath, sqlOutput, 'utf-8');
    console.log(`\n🎉 Successfully exported all existing data to ${targetPath}!`);
}

// Execute if run directly
if (require.main === module) {
    exportDatabaseToSeedsFile()
        .then(() => process.exit(0))
        .catch(err => {
            console.error("Export failed:", err);
            process.exit(1);
        });
}
