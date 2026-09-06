import { Response, Request } from 'express';
import db from '../config/db';
import { logAction } from '../utils/logger';
import { notifyAdmins } from './notificationController';

// Use this interface to fix 'req.user' TypeScript errors
interface AuthRequest extends Request {
    user?: { id: number; role?: string };
}

/**
 * Calculates net credit OJT hours with standard 1-hour unpaid lunch break deduction.
 * If raw duration is >= 5.0 hours, deduct 1.0 hour for standard lunch break (12:00 - 1:00 PM).
 * Example: 9.0 elapsed hours (08:00 - 17:00) yields 8.0 credit hours.
 * Example: 4.0 elapsed hours (08:00 - 12:00) yields 4.0 credit hours.
 */
export const calculateCreditHours = (rawHours: number): number => {
    if (rawHours >= 5.0) {
        return Math.max(0, parseFloat((rawHours - 1.0).toFixed(2)));
    }
    return Math.max(0, parseFloat(rawHours.toFixed(2)));
};

export const toggleAttendance = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "User not authenticated" });

    const { action } = req.body;

    try {
        if (action === 'clock-in') {
            const now = new Date();
            const hour = now.getHours();
            const minute = now.getMinutes();
            const dayOfWeek = now.getDay(); // 0 = Sun, 6 = Sat

            const shiftStartStr = req.body.shiftStart || '08:00';
            const shiftEndStr = req.body.shiftEnd || '17:00';
            const gracePeriodMins = typeof req.body.gracePeriod === 'number' ? req.body.gracePeriod : 15;
            const allowWeekend = req.body.allowWeekendAttendance !== undefined ? req.body.allowWeekendAttendance : false;

            // Weekend restriction check
            if (!allowWeekend && (dayOfWeek === 0 || dayOfWeek === 6)) {
                return res.status(400).json({ 
                    message: "It's weekend — spend your time with your family and get rest!" 
                });
            }

            // Duty hours restriction calculation: 30 mins before shiftStart to latest boundary
            const [startH, startM] = shiftStartStr.split(':').map(Number);
            const [endH, endM] = shiftEndStr.split(':').map(Number);

            const earliestMins = Math.max(0, (startH * 60 + (startM || 0)) - 30);
            const latestMins = Math.max(18 * 60, (endH * 60 + (endM || 0)) + 60);

            const currentMinutes = hour * 60 + minute;
            if (currentMinutes < earliestMins || currentMinutes >= latestMins) {
                return res.status(400).json({ 
                    message: `Clock-in is restricted outside official duty hours (${shiftStartStr} - ${shiftEndStr}).` 
                });
            }

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

            // Late threshold calculation: shiftStart + gracePeriod (e.g., 08:00 + 15m = 08:15 AM)
            const lateThresholdMins = (startH * 60 + (startM || 0)) + gracePeriodMins;
            let status = 'Present';

            if (currentMinutes > lateThresholdMins) {
                status = 'Late';
            }

            const clockInTime = now.toLocaleTimeString('en-US', { 
                hour12: true, 
                hour: '2-digit', 
                minute: '2-digit' 
            });

            const notes = req.body.notes || req.body.reason || null;

            await db.execute(
                'INSERT INTO attendance (user_id, date, clock_in, status, notes, is_active, approval_status) VALUES (?, CURDATE(), NOW(), ?, ?, 1, \'Approved\')',
                [userId, status, notes]
            );

            // Audit Log
            await logAction(userId, 'CREATE', 'Attendance', `Clocked in for shift (Status: ${status})`);

            // Notify Admins
            const [uRows]: any = await db.execute('SELECT full_name FROM users WHERE id = ?', [userId]);
            const studentName = (uRows && uRows[0]?.full_name) || 'An OJT Student';
            await notifyAdmins('Student Clocked In', `${studentName} clocked in for shift (Status: ${status}).`, 'info');

            return res.json({ 
                success: true, 
                status, 
                clock_in: clockInTime 
            });
        } 
        
        if (action === 'clock-out') {
            // Find active attendance session for this user
            const [activeRows]: any = await db.execute(`
                SELECT id, date, clock_in 
                FROM attendance 
                WHERE user_id = ? AND (is_active = 1 OR clock_out IS NULL)
                ORDER BY id DESC LIMIT 1
            `, [userId]);

            if (!activeRows || activeRows.length === 0) {
                return res.status(404).json({ message: "No active session found to clock out." });
            }

            const activeRecord = activeRows[0];
            const recordDateStr = typeof activeRecord.date === 'string' 
                ? activeRecord.date.split('T')[0] 
                : new Date(activeRecord.date).toISOString().split('T')[0];

            // Company Closing Cutoff calculation (shiftEnd + 90 mins allowance, default 17:00 + 90m = 18:30 / 6:30 PM)
            const shiftEndStr = req.body.shiftEnd || '17:00';
            const [endH, endM] = shiftEndStr.split(':').map(Number);
            const extensionMins = 90; // 1 hour 30 mins extension limit
            const cutoffTotalMins = (endH * 60 + (endM || 0)) + extensionMins;
            const cutoffH = String(Math.floor(cutoffTotalMins / 60)).padStart(2, '0');
            const cutoffM = String(cutoffTotalMins % 60).padStart(2, '0');
            const closingCutoffStr = `${recordDateStr} ${cutoffH}:${cutoffM}:00`;

            const now = new Date();
            const closingCutoffDate = new Date(closingCutoffStr);

            // If actual clock-out happens after company closing time (e.g., 8:23 PM), cap at company closing cutoff (6:30 PM)
            let effectiveClockOutStr: string;
            let effectiveClockOutDate: Date;

            if (now > closingCutoffDate) {
                effectiveClockOutStr = closingCutoffStr;
                effectiveClockOutDate = closingCutoffDate;
            } else {
                const year = now.getFullYear();
                const month = String(now.getMonth() + 1).padStart(2, '0');
                const day = String(now.getDate()).padStart(2, '0');
                const hours = String(now.getHours()).padStart(2, '0');
                const mins = String(now.getMinutes()).padStart(2, '0');
                const secs = String(now.getSeconds()).padStart(2, '0');
                effectiveClockOutStr = `${year}-${month}-${day} ${hours}:${mins}:${secs}`;
                effectiveClockOutDate = now;
            }

            // Calculate raw hours and net credit hours with 1-hr lunch deduction if >= 5 hrs
            const clockInDate = new Date(activeRecord.clock_in.includes('T') ? activeRecord.clock_in : `${recordDateStr} ${activeRecord.clock_in}`);
            const diffMs = effectiveClockOutDate.getTime() - (isNaN(clockInDate.getTime()) ? new Date().getTime() : clockInDate.getTime());
            const rawHours = Math.max(0, parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2)));
            const totalHours = calculateCreditHours(rawHours);

            await db.execute(`
                UPDATE attendance 
                SET clock_out = ?, 
                    is_active = 0,
                    total_hours = ?
                WHERE id = ?
            `, [effectiveClockOutStr, totalHours, activeRecord.id]);

            // Audit Log
            await logAction(userId, 'UPDATE', 'Attendance', `Clocked out of shift (${totalHours} credit hrs logged with 1hr lunch break policy)`);

            // Notify Admins
            const [uRows]: any = await db.execute('SELECT full_name FROM users WHERE id = ?', [userId]);
            const studentName = (uRows && uRows[0]?.full_name) || 'An OJT Student';
            await notifyAdmins('Student Clocked Out', `${studentName} clocked out of shift (${totalHours} hrs credited).`, 'info');

            return res.json({ success: true, message: "Clocked out successfully", total_hours: totalHours });
        }
    } catch (error) {
        console.error("Database Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const autoCapOvertimeAttendanceLogs = async () => {
    try {
        // 1. Auto-cap any record where clock_out > '18:30:00'
        await db.execute(`
            UPDATE attendance 
            SET is_active = 0 
            WHERE is_active = 1 AND date < CURDATE()
        `);
    } catch (err) {
        // Silent error prevention for auto-capping
    }
};

export const getAllAttendance = async (_req: Request, res: Response) => {
    try {
        // Auto-fix any historical logs that exceed company closing time (6:30 PM)
        await autoCapOvertimeAttendanceLogs();

        // 1. Fetch real attendance logs
        const sqlLogs = `
            SELECT a.id, a.user_id, a.date, a.clock_in, a.clock_out, a.status, a.total_hours, a.is_active,
                   a.approval_status, a.admin_remarks,
                   u.full_name as student_name, u.profile_pic, u.student_id, u.course 
            FROM attendance a 
            LEFT JOIN users u ON a.user_id = u.id 
            ORDER BY a.date DESC, a.id DESC
        `;
        const [logs]: any = await db.execute(sqlLogs);

        // 2. Fetch all active student interns
        const sqlStudents = `
            SELECT id, full_name as student_name, profile_pic, student_id, course 
            FROM users 
            WHERE role = 'student' AND (is_active IS NOT FALSE)
        `;
        const [students]: any = await db.execute(sqlStudents);

        // 3. Determine unique dates to check for attendance
        // Always include TODAY's date (formatted as YYYY-MM-DD in local time)
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const todayStr = `${year}-${month}-${day}`;

        const uniqueDates = new Set<string>();
        uniqueDates.add(todayStr);

        const formatDateHelper = (val: any) => {
            if (!val) return todayStr;
            if (typeof val === 'string') return val.split('T')[0];
            if (val instanceof Date) {
                const y = val.getFullYear();
                const m = String(val.getMonth() + 1).padStart(2, '0');
                const d = String(val.getDate()).padStart(2, '0');
                return `${y}-${m}-${d}`;
            }
            return String(val).split('T')[0];
        };

        logs.forEach((log: any) => {
            if (log.date) {
                uniqueDates.add(formatDateHelper(log.date));
            }
        });

        // Map logged attendance by date + user_id
        const loggedMap = new Set<string>();
        logs.forEach((log: any) => {
            const dStr = formatDateHelper(log.date);
            loggedMap.add(`${dStr}_${log.user_id}`);
        });

        // 4. Generate Absent entries for active students who didn't clock in on each date
        const absentLogs: any[] = [];
        let synthId = -1;

        Array.from(uniqueDates).forEach((dateStr) => {
            students.forEach((st: any) => {
                const key = `${dateStr}_${st.id}`;
                if (!loggedMap.has(key)) {
                    absentLogs.push({
                        id: synthId--,
                        user_id: st.id,
                        student_name: st.student_name,
                        profile_pic: st.profile_pic,
                        student_id: st.student_id,
                        course: st.course,
                        date: dateStr,
                        clock_in: '---',
                        clock_out: '---',
                        status: 'Absent',
                        total_hours: 0,
                        is_active: 0,
                        approval_status: 'Approved',
                        admin_remarks: null
                    });
                }
            });
        });

        // Combine real logs and absent records, sorted by date DESC, student_name ASC
        const combined = [...logs, ...absentLogs].sort((a, b) => {
            const dateA = formatDateHelper(a.date);
            const dateB = formatDateHelper(b.date);
            if (dateA !== dateB) {
                return dateB.localeCompare(dateA); // Newest dates first
            }
            return (a.student_name || '').localeCompare(b.student_name || '');
        });

        res.status(200).json({ success: true, data: combined });
    } catch (err) {
        console.error("GetAllAttendance Error:", err);
        res.status(500).json({ success: false, message: "Database error" });
    }
};

export const getStudentStats = async (req: Request, res: Response) => {
    const { userId } = req.params;
    const sql = "SELECT * FROM attendance WHERE user_id = ? ORDER BY date DESC";

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
                COALESCE(SUM(CASE WHEN approval_status = 'Approved' OR approval_status IS NULL THEN total_hours ELSE 0 END), 0) as accumulated_hours,
                COUNT(CASE WHEN (approval_status = 'Approved' OR approval_status IS NULL) AND (status = 'Present' OR status = 'Late') THEN 1 END) as days_present,
                COUNT(CASE WHEN (approval_status = 'Approved' OR approval_status IS NULL) AND status = 'Late' THEN 1 END) as days_late
            FROM attendance 
            WHERE user_id = ?
        `, [userId]);

        res.json(rows[0]); 
    } catch (error) {
        console.error("Report Error:", error);
        res.status(500).json({ error: "Failed to generate report" });
    }
};

export const getMyAttendanceHistory = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ message: "Not authorized" });
    }

    try {
        // Auto-fix any historical logs that exceed company closing time (6:30 PM)
        await autoCapOvertimeAttendanceLogs();

        // 1. Fetch student registration date
        const [userRows]: any = await db.execute(
            'SELECT created_at FROM users WHERE id = ?',
            [userId]
        );
        const userCreatedAt = userRows && userRows[0]?.created_at ? new Date(userRows[0].created_at) : new Date();

        // 2. Fetch all real logs for this student
        const [rows]: any = await db.execute(
            `SELECT id, user_id, date, clock_in, clock_out, status, total_hours, is_active,
                    approval_status, admin_remarks
             FROM attendance 
             WHERE user_id = ? 
             ORDER BY date DESC`,
            [userId]
        );

        // Map existing dates logged
        const loggedDates = new Set<string>();
        rows.forEach((log: any) => {
            if (log.date) {
                const cleanDate = typeof log.date === 'string' ? log.date.split('T')[0] : String(log.date);
                loggedDates.add(cleanDate);
            }
        });

        // 3. Synthesize Absent records for past weekdays (Mon-Fri) from student account creation to today
        const absentLogs: any[] = [];
        const now = new Date();
        const currentHour = now.getHours();

        const startDate = new Date(userCreatedAt);
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(now);
        endDate.setHours(0, 0, 0, 0);

        let iterDate = new Date(startDate);
        let synthId = -100;

        const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

        while (iterDate <= endDate) {
            const dayOfWeek = iterDate.getDay(); // 0 = Sun, 6 = Sat
            const year = iterDate.getFullYear();
            const month = String(iterDate.getMonth() + 1).padStart(2, '0');
            const day = String(iterDate.getDate()).padStart(2, '0');
            const dateStr = `${year}-${month}-${day}`;

            const isToday = dateStr === todayStr;

            // Exclude weekends (Sunday=0, Saturday=6)
            if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                // If today, only mark as Absent if past duty cutoff (6:00 PM / 18:00) and no clock-in occurred
                const shouldMarkAbsent = !isToday || (isToday && currentHour >= 18);

                if (shouldMarkAbsent && !loggedDates.has(dateStr)) {
                    absentLogs.push({
                        id: synthId--,
                        user_id: userId,
                        date: dateStr,
                        clock_in: '---',
                        clock_out: '---',
                        status: 'Absent',
                        total_hours: 0,
                        is_active: 0,
                        approval_status: 'Approved',
                        admin_remarks: null
                    });
                }
            }

            iterDate.setDate(iterDate.getDate() + 1);
        }

        // Combine real logs and absent records, sorted DESC by date
        const combined = [...rows, ...absentLogs].sort((a, b) => {
            const dateA = typeof a.date === 'string' ? a.date.split('T')[0] : String(a.date);
            const dateB = typeof b.date === 'string' ? b.date.split('T')[0] : String(b.date);
            return dateB.localeCompare(dateA);
        });

        res.json({ success: true, data: combined });
    } catch (error) {
        console.error("History Error:", error);
        res.status(500).json({ message: "Error fetching your history" });
    }
};

/**
 * POST /api/attendance/request-manual
 * Student requests a manual attendance log (e.g., fieldwork, forgot to clock in)
 * Defaults to approval_status = 'Pending'
 */
export const requestManualAttendance = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "User not authenticated" });

    const { date, clock_in, clock_out, status, reason } = req.body;

    if (!date || !clock_in || !clock_out) {
        return res.status(400).json({ message: "Date, clock in, and clock out times are required." });
    }

    try {
        const start = new Date(`${date} ${clock_in}`);
        const end = new Date(`${date} ${clock_out}`);
        
        const diffInMs = end.getTime() - start.getTime();
        const rawHours = parseFloat((diffInMs / (1000 * 60 * 60)).toFixed(2));

        if (rawHours <= 0) {
            return res.status(400).json({ message: "Clock out time must be after clock in time." });
        }

        // Apply 1-hour lunch break deduction if raw shift >= 5.0 hours
        const totalHours = calculateCreditHours(rawHours);

        const sql = `
            INSERT INTO attendance (user_id, date, clock_in, clock_out, status, total_hours, is_active, approval_status, admin_remarks) 
            VALUES (?, ?, ?, ?, ?, ?, 0, 'Pending', ?)
        `;

        await db.execute(sql, [userId, date, clock_in, clock_out, status || 'Present', totalHours, reason || null]);

        // Audit Log
        await logAction(userId, 'CREATE', 'Attendance', `Requested manual attendance for ${date} (${totalHours} credit hrs, Pending Approval)`);

        // Notify Admins
        const [uRows]: any = await db.execute('SELECT full_name FROM users WHERE id = ?', [userId]);
        const studentName = (uRows && uRows[0]?.full_name) || 'An OJT Student';
        await notifyAdmins('Manual Attendance Request', `${studentName} submitted a manual log request for ${date} (${totalHours} hrs).`, 'warning');

        return res.json({ 
            success: true, 
            message: "Manual attendance request submitted for admin review!",
            totalHours 
        });
    } catch (error) {
        console.error("Manual Request Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

/**
 * PUT /api/attendance/:id/approve
 * Admin approves a pending attendance log
 */
export const approveAttendance = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const adminId = req.user?.id || 0;

    try {
        const [rows]: any = await db.execute('SELECT a.*, u.full_name FROM attendance a LEFT JOIN users u ON a.user_id = u.id WHERE a.id = ?', [id]);
        if (!rows || rows.length === 0) {
            return res.status(404).json({ message: "Attendance record not found." });
        }

        const record = rows[0];

        await db.execute(`
            UPDATE attendance 
            SET approval_status = 'Approved',
                admin_remarks = NULL 
            WHERE id = ?
        `, [id]);

        await logAction(adminId, 'UPDATE', 'Attendance', `Approved manual attendance record #${id} for ${record.full_name} (${record.total_hours} hrs)`);

        return res.json({ success: true, message: `Approved attendance log for ${record.full_name}.` });
    } catch (error) {
        console.error("Approve Attendance Error:", error);
        res.status(500).json({ message: "Failed to approve attendance log." });
    }
};

/**
 * PUT /api/attendance/:id/reject
 * Admin rejects a pending attendance log with optional remarks
 */
export const rejectAttendance = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const adminId = req.user?.id || 0;
    const { admin_remarks } = req.body;

    try {
        const [rows]: any = await db.execute('SELECT a.*, u.full_name FROM attendance a LEFT JOIN users u ON a.user_id = u.id WHERE a.id = ?', [id]);
        if (!rows || rows.length === 0) {
            return res.status(404).json({ message: "Attendance record not found." });
        }

        const record = rows[0];

        await db.execute(`
            UPDATE attendance 
            SET approval_status = 'Rejected',
                admin_remarks = ?
            WHERE id = ?
        `, [admin_remarks || 'Rejected by administrator', id]);

        await logAction(adminId, 'UPDATE', 'Attendance', `Rejected manual attendance record #${id} for ${record.full_name}. Reason: ${admin_remarks || 'None'}`);

        return res.json({ success: true, message: `Rejected attendance log for ${record.full_name}.` });
    } catch (error) {
        console.error("Reject Attendance Error:", error);
        res.status(500).json({ message: "Failed to reject attendance log." });
    }
};

export const addManualLog = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "User not authenticated" });

    const { date, clock_in, clock_out, status } = req.body;

    try {
        const start = new Date(`${date} ${clock_in}`);
        const end = new Date(`${date} ${clock_out}`);
        
        const diffInMs = end.getTime() - start.getTime();
        const rawHours = parseFloat((diffInMs / (1000 * 60 * 60)).toFixed(2));

        if (rawHours < 0) {
            return res.status(400).json({ message: "Clock out time must be after clock in time." });
        }

        // Apply 1-hour lunch break deduction if raw shift >= 5.0 hours
        const totalHours = calculateCreditHours(rawHours);

        const sql = `
            INSERT INTO attendance (user_id, date, clock_in, clock_out, status, total_hours, is_active, approval_status) 
            VALUES (?, ?, ?, ?, ?, ?, 0, 'Approved')
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
        const [existing]: any = await db.execute(
            'SELECT id FROM attendance WHERE user_id = ? AND date = ? LIMIT 1',
            [userId, date]
        );

        if (existing.length > 0) {
            return res.status(400).json({ 
                message: `Attendance record already exists for ${date}.` 
            });
        }

        const start = new Date(`${date} ${clock_in}`);
        const end = new Date(`${date} ${clock_out}`);
        const diffInMs = end.getTime() - start.getTime();
        const rawHours = Math.max(0, parseFloat((diffInMs / (1000 * 60 * 60)).toFixed(2)));
        const totalHours = calculateCreditHours(rawHours);

        await db.execute(`
            INSERT INTO attendance (user_id, date, clock_in, clock_out, status, total_hours, is_active, approval_status)
            VALUES (?, ?, ?, ?, ?, ?, 0, 'Approved')
        `, [userId, date, clock_in, clock_out, status, totalHours]);

        return res.json({ success: true, message: "Manual entry saved successfully." });
    } catch (error) {
        console.error("Manual Log Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const bulkApproveAttendance = async (req: AuthRequest, res: Response) => {
    const { ids, status } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ message: "No attendance record IDs provided for bulk approval." });
    }

    const targetStatus = status || 'Present';
    try {
        const placeholders = ids.map(() => '?').join(',');
        await db.execute(
            `UPDATE attendance SET status = ?, approval_status = 'Approved' WHERE id IN (${placeholders})`,
            [targetStatus, ...ids]
        );

        await logAction(req.user?.id || 0, 'UPDATE', 'Attendance', `Bulk updated ${ids.length} attendance records to status: ${targetStatus}`);
        return res.json({ success: true, message: `Successfully updated ${ids.length} attendance records to "${targetStatus}".` });
    } catch (error) {
        console.error("Bulk Approve Error:", error);
        return res.status(500).json({ message: "Failed to update attendance status in bulk." });
    }
};