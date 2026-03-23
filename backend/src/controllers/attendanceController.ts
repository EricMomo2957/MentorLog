import { Response, Request } from 'express';
import db from '../config/db';

// Use this interface to fix 'req.user' TypeScript errors
interface AuthRequest extends Request {
    user?: { id: number };
}

export const toggleAttendance = async (req: AuthRequest, res: Response) => {
    // Check if user exists before accessing .id to prevent server crash
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "User not authenticated" });

    const { action } = req.body;

    try {
        if (action === 'clock-in') {
            const [rows]: any = await db.execute(
                'SELECT id FROM attendance WHERE user_id = ? AND date = CURDATE() LIMIT 1',
                [userId]
            );

            if (rows && rows.length > 0) {
                return res.status(400).json({ 
                    message: "Attendance already logged for today." 
                });
            }

            const now = new Date();
            const hour = now.getHours();
            const minute = now.getMinutes();
            let status = 'Present';

            // 8:15 AM Grace Period logic
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
                    total_hours = TIMESTAMPDIFF(SECOND, clock_in, NOW()) / 3600 
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
        // Use [rows] for mysql2/promise to remove the "No overload" error
        const [results] = await db.execute(sql);
        res.status(200).json({ success: true, data: results });
    } catch (err) {
        res.status(500).json({ success: false, message: "Database error" });
    }
};

export const getStudentStats = async (req: Request, res: Response) => {
    const { userId } = req.params;
    const sql = "SELECT * FROM attendance WHERE user_id = ?";

    try {
        const [results] = await db.execute(sql, [userId]);
        res.json({ success: true, data: results });
    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message });
    }
};

export const getWeeklyReport = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ message: "Not authorized" });

        const [rows]: any = await db.execute(`
            SELECT 
                COALESCE(SUM(total_hours), 0) as accumulated_hours,
                COUNT(id) as days_present,
                COUNT(CASE WHEN status = 'Late' THEN 1 END) as days_late
            FROM attendance 
            WHERE user_id = ?
        `, [userId]);

        // Return the first row directly
        res.json(rows[0]); 
    } catch (error) {
        console.error("Report Error:", error);
        res.status(500).json({ error: "Failed to generate report" });
    }
};