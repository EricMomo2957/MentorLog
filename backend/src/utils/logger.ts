import db from '../config/db';

export const logAction = async (userId: number, action: string, module: string, details: string) => {
    try {
        const query = `INSERT INTO audit_logs (user_id, action, module, details) VALUES (?, ?, ?, ?)`;
        await db.execute(query, [userId, action, module, details]);
    } catch (error) {
        console.error("Logger Error:", error);
    }
};