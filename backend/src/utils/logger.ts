import db from '../config/db';

export const logAction = async (userId: number | null | undefined, action: string, module: string, details: string) => {
    try {
        const query = `INSERT INTO audit_logs (user_id, action, module, details) VALUES (?, ?, ?, ?)`;
        // Fallback to 0 (System User ID) if userId is null or undefined to prevent SQL ER_BAD_NULL_ERROR
        const validUserId = (userId && !isNaN(Number(userId)) && Number(userId) > 0) ? Number(userId) : 0;
        await db.execute(query, [validUserId, action, module, details]);
    } catch (error) {
        console.error("Logger Error:", error);
    }
};