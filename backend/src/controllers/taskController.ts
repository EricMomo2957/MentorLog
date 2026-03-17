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