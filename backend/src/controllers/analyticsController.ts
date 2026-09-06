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

        // D. Fetch Service Request Breakdown
        const [sPending, sProcessing, sAccepted, sRejected] = await Promise.all([
            getStatusCount('service_requests', 'Pending'),
            getStatusCount('service_requests', 'Processing'),
            getStatusCount('service_requests', 'Accepted'),
            getStatusCount('service_requests', 'Rejected')
        ]);

        // E. Fetch Student Progress & Pace Analytics (At-Risk Early Warning Tracker)
        let studentPaceList: any[] = [];
        try {
            const [studentRows]: any = await db.execute(`
                SELECT 
                    u.id, 
                    u.full_name, 
                    u.email, 
                    u.student_id as student_number,
                    u.course,
                    u.company_name, 
                    COALESCE(u.required_hours, 600) as required_hours,
                    u.created_at,
                    COALESCE(SUM(CASE WHEN a.approval_status = 'Approved' OR a.approval_status IS NULL THEN a.total_hours ELSE 0 END), 0) as total_hours,
                    COUNT(CASE WHEN a.status = 'Absent' THEN 1 END) as absent_count,
                    COUNT(CASE WHEN a.status = 'Late' THEN 1 END) as late_count,
                    MIN(a.date) as first_log_date,
                    MAX(a.date) as last_log_date,
                    COUNT(DISTINCT a.date) as active_days
                FROM users u
                LEFT JOIN attendance a ON u.id = a.user_id
                WHERE u.role = 'student' AND (u.is_active = 1 OR u.is_active = TRUE)
                GROUP BY u.id, u.full_name, u.email, u.student_id, u.course, u.company_name, u.required_hours, u.created_at
            `);

            const now = new Date();
            studentPaceList = (studentRows || []).map((s: any) => {
                const totalHours = Number(s.total_hours) || 0;
                const reqHours = Number(s.required_hours) || 600;
                const absentCount = Number(s.absent_count) || 0;
                const progressPct = Math.min(100, (totalHours / reqHours) * 100);

                // Calculate active duration in weeks
                const startDate = s.first_log_date ? new Date(s.first_log_date) : new Date(s.created_at || now);
                const diffTime = Math.max(0, now.getTime() - startDate.getTime());
                const weeksElapsed = Math.max(1, diffTime / (1000 * 60 * 60 * 24 * 7));
                const weeklyVelocity = parseFloat((totalHours / weeksElapsed).toFixed(1));

                // Determine days since last clock-in
                let daysSinceLastLog: number | string = 'Never';
                if (s.last_log_date) {
                    const lastDate = new Date(s.last_log_date);
                    const days = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
                    daysSinceLastLog = days;
                }

                let paceStatus: 'On Track' | 'Behind Pace' | 'At-Risk' | 'Completed' = 'On Track';
                let reason = 'Maintaining healthy weekly attendance pace';

                if (totalHours >= reqHours) {
                    paceStatus = 'Completed';
                    reason = 'OJT target hours completed! 🎉';
                } else if (absentCount >= 3 || (typeof daysSinceLastLog === 'number' && daysSinceLastLog > 10) || (weeklyVelocity < 15 && totalHours > 0)) {
                    paceStatus = 'At-Risk';
                    if (absentCount >= 3) reason = `High absenteeism (${absentCount} absences recorded)`;
                    else if (typeof daysSinceLastLog === 'number' && daysSinceLastLog > 10) reason = `No clock-ins recorded for ${daysSinceLastLog} days`;
                    else reason = `Critical low velocity (${weeklyVelocity} hrs/wk vs 35 target)`;
                } else if (weeklyVelocity < 28) {
                    paceStatus = 'Behind Pace';
                    reason = `Pacing below standard rate (${weeklyVelocity} hrs/wk)`;
                }

                return {
                    id: s.id,
                    student_name: s.full_name,
                    student_number: s.student_number,
                    email: s.email,
                    course: s.course,
                    company_name: s.company_name,
                    total_hours: totalHours,
                    required_hours: reqHours,
                    progress_percentage: parseFloat(progressPct.toFixed(1)),
                    absent_count: absentCount,
                    late_count: Number(s.late_count) || 0,
                    weekly_velocity: weeklyVelocity,
                    days_since_last_log: typeof daysSinceLastLog === 'number' ? `${daysSinceLastLog}d ago` : 'Never',
                    pace_status: paceStatus,
                    risk_reason: reason
                };
            });
        } catch (err) {
            console.error("Error computing at-risk analytics:", err);
        }

        const atRiskOnly = studentPaceList.filter((s) => s.pace_status === 'At-Risk' || s.pace_status === 'Behind Pace');

        // Send structured response
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
                    inProcess: inProgress,
                    completed
                },
                requestDetails: {
                    pending: sPending,
                    processing: sProcessing,
                    accepted: sAccepted,
                    rejected: sRejected
                },
                studentPaceList,
                atRiskStudents: atRiskOnly,
                atRiskCount: atRiskOnly.length
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