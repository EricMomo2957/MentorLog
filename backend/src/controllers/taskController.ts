import { Request, Response } from 'express';
import pool from '../config/db';

export const submitTask = async (req: Request, res: Response) => {
    // user_id comes from our verifyToken middleware
    const { task_description } = req.body;
    const user_id = (req as any).user.id; 

    try {
        // 1. Insert the task linked to the user and today's date
        await pool.query(
            'INSERT INTO tasks (user_id, task_description, date) VALUES (?, ?, CURDATE())',
            [user_id, task_description]
        );

        res.status(201).json({ message: 'Task report submitted successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error submitting task report.' });
    }
};

export const getMyTasks = async (req: Request, res: Response) => {
    const user_id = (req as any).user.id;

    try {
        const [rows] = await pool.query(
            'SELECT * FROM tasks WHERE user_id = ? ORDER BY date DESC',
            [user_id]
        );
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching your tasks.' });
    }
};

// src/controllers/taskController.ts
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
        console.error("Error fetching all tasks:", error);
        res.status(500).json({ success: false, message: 'Error fetching task logs.' });
    }
};

export const getStudentTasks = async (req: Request, res: Response) => {
    // Usually, req.user is populated by your authMiddleware
    const studentId = (req as any).user.id; 

    try {
        const [rows] = await pool.execute(
            'SELECT * FROM tasks WHERE user_id = ? ORDER BY due_date ASC',
            [studentId]
        );
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching student tasks', error });
    }
};