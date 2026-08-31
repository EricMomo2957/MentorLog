import { Response } from 'express';
import db from '../config/db';
import { AuthRequest } from '../middleware/authMiddleware';

// Define an interface for database count results to avoid 'any'
interface CountResult {
    count: number;
}

// 1. Helper function to count total rows safely
const getCount = async (tableName: string): Promise<number> => {
    try {
        const [rows] = await db.execute(`SELECT COUNT(*) as count FROM ${tableName}`) as [CountResult[], any];
        return parseInt(String(rows[0]?.count || 0), 10);
    } catch (error: any) {
        if (error.errno === 1146) {
            console.warn(`⚠️ Warning: Table '${tableName}' not found. Returning 0.`);
            return 0;
        }
        return 0;
    }
};

// 2. Flexible Helper function to count specific statuses in any table
const getStatusCount = async (tableName: string, status: string): Promise<number> => {
    try {
        // Using [status] as a parameter to prevent SQL injection
        const [rows] = await db.execute(
            `SELECT COUNT(*) as count FROM ${tableName} WHERE status = ?`, 
            [status]
        ) as [CountResult[], any];
        return parseInt(String(rows[0]?.count || 0), 10);
    } catch (error: any) {
        if (error.errno === 1146) return 0;
        console.error(`Error fetching status ${status} from ${tableName}:`, error);
        return 0;
    }
};

export const getSystemStats = async (req: AuthRequest, res: Response) => {
    try {
        // A. Fetch General Module Totals
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

        // B. Fetch Attendance Breakdown (Pie Chart)
        const [present, late, absent] = await Promise.all([
            getStatusCount('attendance', 'Present'),
            getStatusCount('attendance', 'Late'),
            getStatusCount('attendance', 'Absent')
        ]);

        // C. Fetch Task Breakdown (New Bar Graph)
        // UPDATED: Used 'In-Progress' (Capital P) to match your DB Enum
        const [pending, inProgress, completed] = await Promise.all([
            getStatusCount('tasks', 'Pending'),
            getStatusCount('tasks', 'In-Progress'), 
            getStatusCount('tasks', 'Completed')
        ]);

        // NEW: D. Fetch Service Request Breakdown
        // Ensure these strings match your database ENUM exactly
        const [sPending, sProcessing, sAccepted, sRejected] = await Promise.all([
            getStatusCount('service_requests', 'Pending'),
            getStatusCount('service_requests', 'Processing'),
            getStatusCount('service_requests', 'Accepted'),
            getStatusCount('service_requests', 'Rejected')
        ]);

        // D. Send the structured response matching your Frontend Interface
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
                },
                taskDetails: {
                    pending,
                    inProcess: inProgress, // Mapped to the key your frontend expects
                    completed
                },
                // NEW: Service Request Details
                requestDetails: {
                    pending: sPending,
                    processing: sProcessing,
                    accepted: sAccepted,
                    rejected: sRejected
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