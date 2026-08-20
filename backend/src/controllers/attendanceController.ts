import { Response, Request } from 'express';
import db from '../config/db';
import { logAction } from '../utils/logger';

// Use this interface to fix 'req.user' TypeScript errors
interface AuthRequest extends Request {
    user?: { id: number };
}

export const toggleAttendance = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "User not authenticated" });

    const { action } = req.body;

    try {
        if (action === 'clock-in') {
            // Check if ANY record exists for today (Active or Completed)
            const [rows]: any = await db.execute(
                'SELECT id, clock_out FROM attendance WHERE user_id = ? AND date = CURDATE() LIMIT 1',
                [userId]
            );

            // If a record exists for today
            if (rows && rows.length > 0) {
                if (rows[0].clock_out !== null) {
                    return res.status(400).json({ message: "Attendance already completed for today." });
                }
                return res.status(400).json({ message: "You are already clocked in." });
            }

            // Logic for Late vs Present
            const now = new Date();
            const hour = now.getHours();
            const minute = now.getMinutes();
            let status = 'Present';

            // Late if after 8:15 AM
            if (hour > 8 || (hour === 8 && minute > 15)) {
                status = 'Late';
            }

            const clockInTime = now.toLocaleTimeString('en-US', { 
                hour12: true, 
                hour: '2-digit', 
                minute: '2-digit' 
            });

            await db.execute(
                'INSERT INTO attendance (user_id, date, clock_in, status, is_active) VALUES (?, CURDATE(), NOW(), ?, 1)',
                [userId, status]
            );

            // Audit Log
            await logAction(userId, 'CREATE', 'Attendance', `Clocked in for shift (Status: ${status})`);

            return res.json({ 
                success: true, 
                status, 
                clock_in: clockInTime 
            });
        } 
        
        if (action === 'clock-out') {
            const [result]: any = await db.execute(`
                UPDATE attendance 
                SET clock_out = NOW(), 
                    is_active = 0,
                    total_hours = GREATEST(0, TIMESTAMPDIFF(SECOND, clock_in, NOW()) / 3600) 
                WHERE user_id = ? AND (is_active = 1 OR clock_out IS NULL)
                ORDER BY id DESC
                LIMIT 1
            `, [userId]);

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "No active session found to clock out." });
            }

            // Audit Log
            await logAction(userId, 'UPDATE', 'Attendance', `Clocked out of shift`);

            return res.json({ success: true, message: "Clocked out successfully" });
        }
    } catch (error) {
        console.error("Database Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const getAllAttendance = async (_req: Request, res: Response) => {
    const sql = `
        SELECT a.*, u.full_name as student_name, u.profile_pic, u.student_id, u.course 
        FROM attendance a 
        JOIN users u ON a.user_id = u.id 
        ORDER BY a.date DESC
    `;
    try {
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

// Add this to your attendanceController.ts for the Student's personal history
export const getMyAttendanceHistory = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;

    // Safety check: If userId is undefined, don't even try the database
    if (!userId) {
        return res.status(401).json({ message: "Not authorized" });
    }

    try {
        // Wrap [userId] in an array to satisfy the 'ExecuteValues' type
        const [rows] = await db.execute(
            'SELECT * FROM attendance WHERE user_id = ? ORDER BY date DESC LIMIT 10',
            [userId] 
        );
        res.json(rows);
    } catch (error) {
        console.error("History Error:", error);
        res.status(500).json({ message: "Error fetching your history" });
    }
};


export const addManualLog = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "User not authenticated" });

    // Destructure the data from the modal
    const { date, clock_in, clock_out, status } = req.body;

    try {
        // 1. Calculate Total Hours
        // We create date objects to find the difference between clock_in and clock_out
        const start = new Date(`${date} ${clock_in}`);
        const end = new Date(`${date} ${clock_out}`);
        
        // Calculate difference in hours
        const diffInMs = end.getTime() - start.getTime();
        const totalHours = parseFloat((diffInMs / (1000 * 60 * 60)).toFixed(2));

        // Validation: Ensure they didn't pick a clock-out time before clock-in
        if (totalHours < 0) {
            return res.status(400).json({ message: "Clock out time must be after clock in time." });
        }

        // 2. Insert into database
        // is_active is 0 because manual logs are usually for completed shifts
        const sql = `
            INSERT INTO attendance (user_id, date, clock_in, clock_out, status, total_hours, is_active) 
            VALUES (?, ?, ?, ?, ?, ?, 0)
        `;

        await db.execute(sql, [userId, date, clock_in, clock_out, status, totalHours]);

        return res.json({ 
            success: true, 
            message: "Manual attendance logged successfully!",
            totalHours 
        });

    } catch (error) {
        console.error("Manual Log Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const manualAttendanceLog = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    const { date, clock_in, clock_out, status } = req.body;

    try {
        // 1. Check if ANY record (manual or toggle) already exists for this specific date
        const [existing]: any = await db.execute(
            'SELECT id FROM attendance WHERE user_id = ? AND date = ? LIMIT 1',
            [userId, date]
        );

        if (existing.length > 0) {
            return res.status(400).json({ 
                message: `Attendance record already exists for ${date}.` 
            });
        }

        // 2. Calculate hours (MySQL-side calculation for decimal(5,2))
        // Since your table uses decimal(5,2), we ensure the value fits
        await db.execute(`
            INSERT INTO attendance (user_id, date, clock_in, clock_out, status, total_hours, is_active)
            VALUES (?, ?, ?, ?, ?, TIMESTAMPDIFF(SECOND, ?, ?) / 3600, 0)
        `, [userId, date, clock_in, clock_out, status, clock_in, clock_out]);

        return res.json({ success: true, message: "Manual entry saved successfully." });
    } catch (error) {
        console.error("Manual Log Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};