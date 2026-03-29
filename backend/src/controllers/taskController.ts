import { Request, Response } from 'express';
import pool from '../config/db';

// Define a custom interface that extends Express Request
// This fixes the TypeScript "Property 'user' does not exist" errors
interface AuthRequest extends Request {
    user?: {
        id: number;
        role: string;
        full_name?: string;
    };
}

/**
 * 1. Submit a Task Report (Self-submission by Student)
 */
export const submitTask = async (req: AuthRequest, res: Response) => {
    const { task_description, title } = req.body;
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        // Insert linking to user and today's date
        await pool.query(
            'INSERT INTO tasks (user_id, title, task_description, status, due_date) VALUES (?, ?, ?, "Pending", CURDATE())',
            [userId, title || 'Daily Task Report', task_description]
        );

        res.status(201).json({ message: 'Task report submitted successfully!' });
    } catch (error) {
        console.error("Error in submitTask:", error);
        res.status(500).json({ message: 'Error submitting task report.' });
    }
};

/**
 * 2. Get Tasks for the Logged-in Student (Personal View)
 */
export const getMyTasks = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const [rows] = await pool.query(
            'SELECT * FROM tasks WHERE user_id = ? ORDER BY due_date DESC',
            [userId]
        );
        res.status(200).json(rows);
    } catch (error) {
        console.error("Error in getMyTasks:", error);
        res.status(500).json({ message: 'Error fetching your tasks.' });
    }
};

/**
 * 3. Get All Tasks (Admin/Mentor View)
 * Joins with users table to get the student's name
 */
export const getAllTasks = async (req: Request, res: Response) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                t.id, 
                t.title,
                t.task_description, 
                t.status,
                t.due_date, 
                u.full_name as student_name 
            FROM tasks t
            JOIN users u ON t.user_id = u.id
            ORDER BY t.id DESC
        `);
        
        res.status(200).json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error("Error in getAllTasks:", error);
        res.status(500).json({ success: false, message: 'Error fetching task logs.' });
    }
};

/**
 * 4. General Task Fetching (Alias/Utility)
 */
export const getTasks = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    
    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const [rows] = await pool.query(
            'SELECT * FROM tasks WHERE user_id = ? ORDER BY id DESC',
            [userId]
        );
        res.status(200).json(rows);
    } catch (error) {
        console.error("Error in getTasks:", error);
        res.status(500).json({ message: 'Error fetching tasks.' });
    }
};