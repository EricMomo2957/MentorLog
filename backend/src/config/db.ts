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

/**
 * Health check ping to verify MySQL/XAMPP connection
 */
export const checkDbConnection = async (): Promise<boolean> => {
    try {
        await pool.query('SELECT 1');
        return true;
    } catch (err) {
        console.error("❌ MySQL Connection Lost/Failed:", err);
        return false;
    }
};

/**
 * Auto-Schema & Index Initializer for XAMPP / MySQL
 */
const initDb = async () => {
    try {
        // 1. Users Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                full_name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                role ENUM('admin', 'student') DEFAULT 'student',
                student_id VARCHAR(100) NULL,
                course VARCHAR(100) NULL,
                target_hours INT DEFAULT 480,
                profile_pic VARCHAR(255) NULL,
                status VARCHAR(50) DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 2. Attendance Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS attendance (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                date DATE NOT NULL,
                clock_in DATETIME NOT NULL,
                clock_out DATETIME NULL,
                total_hours DECIMAL(5,2) DEFAULT 0,
                status VARCHAR(50) DEFAULT 'Present',
                notes VARCHAR(255) NULL,
                is_active TINYINT(1) DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Ensure attendance columns if altered
        try {
            await pool.query(`ALTER TABLE attendance ADD COLUMN IF NOT EXISTS notes VARCHAR(255) NULL`);
        } catch (_) {}

        // 3. Tasks Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS tasks (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                title VARCHAR(255) NOT NULL,
                task_description TEXT NULL,
                status VARCHAR(50) DEFAULT 'Pending',
                due_date DATETIME NULL,
                attachment_url VARCHAR(255) NULL,
                attachment_name VARCHAR(255) NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Ensure tasks columns if altered
        try {
            await pool.query(`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS attachment_url VARCHAR(255) NULL`);
            await pool.query(`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS attachment_name VARCHAR(255) NULL`);
        } catch (_) {}

        // 4. Notifications Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS notifications (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                title VARCHAR(255) NOT NULL,
                message TEXT NOT NULL,
                type VARCHAR(50) DEFAULT 'info',
                is_read TINYINT(1) DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 5. Audit Logs Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS audit_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                admin_id INT NULL,
                action VARCHAR(100) NOT NULL,
                module VARCHAR(100) NOT NULL,
                details TEXT NOT NULL,
                ip_address VARCHAR(100) NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 6. Document Submissions Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS document_submissions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                student_id INT NOT NULL,
                student_name VARCHAR(255) NOT NULL,
                document_type VARCHAR(100) NOT NULL,
                file_path VARCHAR(255) NOT NULL,
                status VARCHAR(50) DEFAULT 'Pending',
                feedback TEXT NULL,
                submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 7. Service Requests Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS service_requests (
                id INT AUTO_INCREMENT PRIMARY KEY,
                student_id INT NOT NULL,
                student_name VARCHAR(255) NOT NULL,
                subject VARCHAR(255) NOT NULL,
                message TEXT NOT NULL,
                urgency VARCHAR(50) DEFAULT 'Normal',
                status VARCHAR(50) DEFAULT 'Pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 8. Feedbacks Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS feedbacks (
                id INT AUTO_INCREMENT PRIMARY KEY,
                student_id INT NOT NULL,
                student_name VARCHAR(255) NOT NULL,
                category VARCHAR(100) NOT NULL,
                content TEXT NOT NULL,
                rating INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 9. Intern Questions Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS intern_questions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                student_id INT NOT NULL,
                subject VARCHAR(255) NOT NULL,
                message TEXT NOT NULL,
                status VARCHAR(50) DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 10. Question Replies Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS question_replies (
                id INT AUTO_INCREMENT PRIMARY KEY,
                question_id INT NOT NULL,
                sender_id INT NOT NULL,
                sender_role VARCHAR(50) NOT NULL,
                reply_text TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

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

        console.log("✅ MySQL Auto-Schema & Performance Indexes Verified.");
    } catch (err) {
        console.error("⚠️  Database Auto-Schema Init Warning:", err);
    }
};

initDb();

export default pool;