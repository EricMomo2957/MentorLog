import {Request, Response} from 'express';
import pool from '../config/db';

export const getStudentSummary = async (req: Request, res: Response) => {
    try {
        // Query to get student names and their total hours worked
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