import { Request, Response } from 'express';
import db from '../config/db'; // Adjust based on your db export

export const toggleAttendance = async (req: Request, res: Response) => {
    const { userId, action } = req.body;

    try {
        if (action === 'clock-in') {
            const now = new Date();
            const hour = now.getHours();
            const minute = now.getMinutes();

            // Mark as 'Late' if after 8:15 AM
            let attendanceStatus = 'Present';
            if (hour > 8 || (hour === 8 && minute > 15)) {
                attendanceStatus = 'Late';
            }

            const [result]: any = await db.execute(
                'INSERT INTO attendance (user_id, clock_in, status, is_active) VALUES (?, NOW(), ?, TRUE)',
                [userId, attendanceStatus]
            );
            return res.json({ success: true, status: attendanceStatus, id: result.insertId });
        } 
        
        if (action === 'clock-out') {
            await db.execute(
                'UPDATE attendance SET clock_out = NOW(), is_active = FALSE WHERE user_id = ? AND is_active = TRUE',
                [userId]
            );
            return res.json({ success: true, message: "Clocked out" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Database error" });
    }
};

// Add this to your existing attendanceController.ts
export const getAllAttendance = async (req: Request, res: Response) => {
    try {
        const [rows] = await db.execute(`
            SELECT 
                a.id, 
                u.full_name as student_name, 
                a.clock_in, 
                a.clock_out, 
                a.status, 
                a.is_active
            FROM attendance a
            JOIN users u ON a.user_id = u.id
            ORDER BY a.created_at DESC
        `);

        return res.json({ success: true, data: rows });
    } catch (error) {
        console.error("Fetch error:", error);
        res.status(500).json({ error: "Database error" });
    }
};

export const getWeeklyReport = async (req: Request, res: Response) => {
    try {
        const [rows]: any = await db.execute(`
            SELECT 
                u.full_name as student_name, 
                SUM(TIMESTAMPDIFF(MINUTE, a.clock_in, a.clock_out)) / 60 as total_hours,
                COUNT(CASE WHEN a.status = 'Late' THEN 1 END) as late_count,
                COUNT(a.id) as total_days
            FROM users u
            JOIN attendance a ON u.id = a.user_id
            WHERE a.clock_out IS NOT NULL 
              AND a.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            GROUP BY u.id
            ORDER BY total_hours DESC
        `);

        return res.json({ success: true, data: rows });
    } catch (error) {
        console.error("Weekly Report Error:", error);
        res.status(500).json({ error: "Failed to generate weekly report" });
    }
};