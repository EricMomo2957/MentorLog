import { Request, Response } from 'express';
import pool from '../config/db';
import db from '../config/db';

// 1. Existing function for summary/stats
export const getStudentSummary = async (req: Request, res: Response) => {
    try {
        const query = `
            SELECT 
                u.id, 
                u.full_name, 
                u.email,
                COALESCE(SUM(TIMESTAMPDIFF(HOUR, a.time_in, a.time_out)), 0) AS total_hours
            FROM users u
            LEFT JOIN attendance a ON u.id = a.user_id
            WHERE u.role = 'student'
            GROUP BY u.id, u.full_name, u.email
        `;

        const [rows] = await pool.query(query);
        res.status(200).json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching dashboard summary' });
    }
};

// 2. NEW function to feed the "Total Users" and "User Directory" in AdminDashboard
export const getAllUsers = async (req: Request, res: Response) => {
    try {
        // Querying the 'users' table in 'mentorlog_db'
        const [rows] = await db.execute('SELECT id, full_name, email, role, created_at FROM users');
        
        // This structure is required to satisfy your frontend logic
        res.status(200).json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error("Fetch Users Error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export const adminOnly = (req: any, res: any, next: any) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Admins only.' });
    }
};