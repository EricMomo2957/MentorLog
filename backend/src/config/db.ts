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
};
initDb();

export default pool;