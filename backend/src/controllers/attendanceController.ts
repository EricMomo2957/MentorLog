import { Response, Request } from 'express';
import db from '../config/db';

// Helper interface for the request with user info
interface AuthRequest extends Request {
    user?: { id: number };
}

export const toggleAttendance = async (req: any, res: Response) => {
    const userId = req.user.id;
    const { action } = req.body;

    try {
        if (action === 'clock-in') {
            const [existingRecord]: any = await db.execute(
                'SELECT id FROM attendance WHERE user_id = ? AND date = CURDATE() LIMIT 1',
                [userId]
            );

            if (existingRecord.length > 0) {
                return res.status(400).json({ 
                    message: "Attendance already logged for today. You can only log in once per day." 
                });
            }

            const now = new Date();
            const hour = now.getHours();
            const minute = now.getMinutes();
            let status = 'Present';

            // Late logic: If after 8:15 AM
            if (hour > 8 || (hour === 8 && minute > 15)) {
                status = 'Late';
            }

            await db.execute(
                'INSERT INTO attendance (user_id, date, clock_in, status, is_active) VALUES (?, CURDATE(), NOW(), ?, 1)',
                [userId, status]
            );

            return res.json({ success: true, status });
        } 
        
        if (action === 'clock-out') {
            const [result]: any = await db.execute(`
                UPDATE attendance 
                SET clock_out = NOW(), 
                    is_active = 0,
                    total_hours = TIMESTAMPDIFF(MINUTE, clock_in, NOW()) / 60 
                WHERE user_id = ? AND is_active = 1 AND date = CURDATE()
            `, [userId]);

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "No active session found for today." });
            }

            return res.json({ success: true, message: "Clocked out successfully" });
        }
    } catch (error) {
        console.error("Database Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const getAllAttendance = async (_req: Request, res: Response) => {
    const sql = `
        SELECT a.*, u.full_name as student_name 
        FROM attendance a 
        JOIN users u ON a.user_id = u.id 
        ORDER BY a.date DESC
    `;

    try {
        // FIXED: Using await db.execute instead of callbacks to match your db config
        const [results] = await db.execute(sql);
        res.status(200).json({ success: true, data: results });
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).json({ success: false, message: "Database error" });
    }
};

export const getStudentStats = async (req: Request, res: Response) => {
    const { userId } = req.params;
    const sql = "SELECT * FROM attendance WHERE user_id = ?";

    try {
        // FIXED: Using await db.execute and passing userId in the array
        const [results] = await db.execute(sql, [userId]);
        res.json({ success: true, data: results });
    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message });
    }
};

export const getWeeklyReport = async (req: any, res: Response) => {
    try {
        const userId = req.user.id;
        const [rows]: any = await db.execute(`
            SELECT 
                SUM(total_hours) as accumulated_hours,
                COUNT(id) as days_present,
                COUNT(CASE WHEN status = 'Late' THEN 1 END) as days_late
            FROM attendance 
            WHERE user_id = ?
        `, [userId]);

        res.json(rows[0]);
    } catch (error) {
        console.error("Report Error:", error);
        res.status(500).json({ error: "Failed to generate report" });
    }
};