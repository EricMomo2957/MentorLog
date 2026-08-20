import { Request, Response } from 'express';
import db from '../config/db';
import { logAction } from '../utils/logger';
import pool from '../config/db';

/**
 * 1. FETCH ALL USERS
 * GET: /api/admin/users/all
 */
export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const [rows]: any = await db.execute(
            'SELECT id, full_name, email, phone, student_id, course, year_level, profile_pic, role, created_at FROM users ORDER BY created_at DESC'
        );
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        console.error("Fetch All Users Error:", error);
        res.status(500).json({ success: false, message: "Error fetching all users" });
    }
};

/**
 * 2. DASHBOARD SUMMARY
 */
export const getStudentSummary = async (req: Request, res: Response) => {
    try {
        const query = `
            SELECT 
                u.id, 
                u.full_name, 
                u.email,
                u.phone,
                u.profile_pic,
                COALESCE(SUM(TIMESTAMPDIFF(HOUR, a.clock_in, a.clock_out)), 0) AS total_hours
            FROM users u
            LEFT JOIN attendance a ON u.id = a.user_id
            WHERE u.role = 'student'
            GROUP BY u.id, u.full_name, u.email, u.phone, u.profile_pic
        `;

        const [rows] = await db.execute(query);
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        console.error("Dashboard Summary Error:", error);
        res.status(500).json({ success: false, message: 'Error fetching dashboard summary' });
    }
};

/**
 * 3. STUDENT DIRECTORY (FETCH ONLY STUDENTS)
 */
export const getAllStudents = async (req: Request, res: Response) => {
    try {
        const [rows]: any = await db.execute(
            'SELECT id, full_name, email, phone, student_id, course, year_level, profile_pic, ojt_hours_required, role, created_at FROM users WHERE role = "student" ORDER BY created_at DESC'
        );
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        console.error("Fetch Students Error:", error);
        res.status(500).json({ success: false, message: "Error fetching students" });
    }
};

/**
 * 4. UPDATE STUDENT
 */
export const updateStudent = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { full_name, student_id, ojt_hours_required, phone, course, year_level } = req.body;

    try {
        await db.execute(
            'UPDATE users SET full_name = ?, student_id = ?, ojt_hours_required = ?, phone = COALESCE(?, phone), course = COALESCE(?, course), year_level = COALESCE(?, year_level) WHERE id = ? AND role = "student"',
            [full_name, student_id, ojt_hours_required, phone || null, course || null, year_level || null, id]
        );

        await logAction(
            (req as any).user?.id || 0, 
            'UPDATE', 
            'Student Management', 
            `Updated student: ${full_name} (ID: ${student_id})`
        );

        res.status(200).json({ 
            success: true, 
            message: "Student updated successfully and logged." 
        });

    } catch (error) {
        console.error("Update Student Error:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error updating student" 
        });
    }
};

/**
 * 5. DELETE STUDENT
 */
export const deleteStudent = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await db.execute('DELETE FROM users WHERE id = ? AND role = "student"', [id]);
        res.status(200).json({ success: true, message: "Student deleted successfully" });
    } catch (error) {
        console.error("Delete Student Error:", error);
        res.status(500).json({ success: false, message: "Error deleting student" });
    }
};

/**
 * 6. ADMIN MIDDLEWARE
 */
export const adminOnly = (req: any, res: any, next: any) => {
    const role = req.user?.role?.toLowerCase();

    if (req.user && (role === 'admin' || role === 'mentor')) {
        next(); 
    } else {
        return res.status(403).json({ message: "Access denied. Admins only." });
    }
};

/**
 * 7. UPDATE ADMIN PROFILE
 */
export const updateAdminProfile = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { full_name, email, student_id } = req.body; 

    try {
        await db.execute(
            'UPDATE users SET full_name = ?, email = ?, student_id = ? WHERE id = ? AND role = "admin"',
            [full_name, email, student_id, id]
        );
        res.status(200).json({ success: true, message: "Admin profile updated successfully" });
    } catch (error) {
        console.error("Update Admin Error:", error);
        res.status(500).json({ success: false, message: "Error updating admin profile" });
    }
};

/**
 * 8. GET AUDIT LOGS
 */
export const getAuditLogs = async (req: Request, res: Response) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                al.*, 
                u.full_name as admin_name,
                u.profile_pic 
            FROM audit_logs al
            LEFT JOIN users u ON al.user_id = u.id 
            ORDER BY al.created_at DESC
        `);
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ message: "Error fetching logs" });
    }
};