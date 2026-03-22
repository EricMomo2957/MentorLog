import { Response } from 'express';
import db from '../config/db';

export const toggleAttendance = async (req: any, res: Response) => {
    const userId = req.user.id;
    const { action } = req.body;

    try {
        if (action === 'clock-in') {
            // 1. STRICT CHECK: Does any record exist for this user today?
            // This prevents a second "Begin Shift" after they have already clocked out for the day.
            const [existingRecord]: any = await db.execute(
                'SELECT id FROM attendance WHERE user_id = ? AND date = CURDATE() LIMIT 1',
                [userId]
            );

            if (existingRecord.length > 0) {
                return res.status(400).json({ 
                    message: "Attendance already logged for today. You can only log in once per day." 
                });
            }

            // 2. Late logic: If after 8:15 AM
            const now = new Date();
            const hour = now.getHours();
            const minute = now.getMinutes();
            let status = 'Present';

            if (hour > 8 || (hour === 8 && minute > 15)) {
                status = 'Late';
            }

            // 3. Insert new record (Note: CURDATE() ensures the 'date' column is today)
            await db.execute(
                'INSERT INTO attendance (user_id, date, clock_in, status, is_active) VALUES (?, CURDATE(), NOW(), ?, 1)',
                [userId, status]
            );

            return res.json({ success: true, status });
        } 
        
        if (action === 'clock-out') {
            // 1. Calculate hours and update record in one query
            // We search for the record that is specifically marked as 'is_active = 1'
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

export const getAllAttendance = async (req: any, res: Response) => {
    try {
        const userId = req.user.id;
        const [rows]: any = await db.execute(`
            SELECT 
                id, 
                DATE_FORMAT(date, '%Y-%m-%d') as date, 
                TIME_FORMAT(clock_in, '%h:%i %p') as clock_in, 
                TIME_FORMAT(clock_out, '%h:%i %p') as clock_out, 
                status,
                total_hours
            FROM attendance 
            WHERE user_id = ? 
            ORDER BY date DESC, clock_in DESC
        `, [userId]);

        res.json(rows);
    } catch (error) {
        console.error("Fetch Error:", error);
        res.status(500).json({ error: "Failed to fetch attendance history" });
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
        res.status(500).json({ error: "Failed to generate report" });
    }
};