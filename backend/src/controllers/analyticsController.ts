import { Response } from 'express';
import db from '../config/db';
import { AuthRequest } from '../middleware/authMiddleware';

// Helper function to count total rows safely
const getCount = async (tableName: string): Promise<number> => {
    try {
        const [rows]: any = await db.execute(`SELECT COUNT(*) as count FROM ${tableName}`);
        return rows[0].count;
    } catch (error: any) {
        if (error.errno === 1146) {
            console.warn(`⚠️ Warning: Table '${tableName}' not found. Returning 0.`);
            return 0;
        }
        throw error;
    }
};

// Helper function to count specific attendance statuses
const getStatusCount = async (status: string): Promise<number> => {
    try {
        // Adjust 'status' to match your actual column name in the attendance table
        const [rows]: any = await db.execute(
            `SELECT COUNT(*) as count FROM attendance WHERE status = ?`, 
            [status]
        );
        return rows[0].count;
    } catch (error: any) {
        console.error(`Error fetching status ${status}:`, error);
        return 0;
    }
};

export const getSystemStats = async (req: AuthRequest, res: Response) => {
    try {
        // 1. Fetch General Module Totals
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
            getCount('service_requests'), 
            getCount('tasks'),
            getCount('users')
        ]);

        // 2. Fetch Specific Attendance Details for the new Pie Chart
        const [present, late, absent] = await Promise.all([
            getStatusCount('Present'),
            getStatusCount('Late'),
            getStatusCount('Absent')
        ]);

        // 3. Send the structured response
        res.status(200).json({
            success: true,
            data: {
                announcements,
                attendance,
                events,
                feedbacks,
                requests,
                tasks,
                users,
                attendanceDetails: {
                    present,
                    late,
                    absent
                }
            }
        });
    } catch (error) {
        console.error("Analytics Error:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error generating reports" 
        });
    }
};