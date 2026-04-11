import { Response } from 'express';
import db from '../config/db';
import { AuthRequest } from '../middleware/authMiddleware';

// Helper function to count safely
const getCount = async (tableName: string): Promise<number> => {
    try {
        const [rows]: any = await db.execute(`SELECT COUNT(*) as count FROM ${tableName}`);
        return rows[0].count;
    } catch (error: any) {
        // If table doesn't exist (Error 1146), return 0 instead of crashing
        if (error.errno === 1146) {
            console.warn(`⚠️ Warning: Table '${tableName}' not found. Returning 0.`);
            return 0;
        }
        throw error;
    }
};

export const getSystemStats = async (req: AuthRequest, res: Response) => {
    try {
        // Run counts one by one (or with Promise.all using the helper)
        const [
            announcements,
            attendance,
            events,
            feedbacks,
            requests,
            tasks,
            users
        ] = await Promise.all([
            getCount('announcements'),
            getCount('attendance'),
            getCount('events'),
            getCount('feedbacks'),
            getCount('service_requests'), // Make sure this matches your DB
            getCount('tasks'),
            getCount('users')
        ]);

        res.status(200).json({
            success: true,
            data: {
                announcements,
                attendance,
                events,
                feedbacks,
                requests,
                tasks,
                users
            }
        });
    } catch (error) {
        console.error("Analytics Error:", error);
        res.status(500).json({ success: false, message: "Error generating reports" });
    }
};