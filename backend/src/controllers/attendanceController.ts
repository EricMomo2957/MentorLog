import { Request, Response } from 'express';
import pool from '../config/db';

export const timeIn = async (req: Request, res: Response) => {
    const { user_id } = req.body; // In the future, we will get this from the JWT token

    try {
        // 1. Check if student already timed in today
        const [existing]: any = await pool.query(
            'SELECT * FROM attendance WHERE user_id = ? AND date = CURDATE() AND time_out IS NULL',
            [user_id]
        );

        if (existing.length > 0) {
            return res.status(400).json({ message: 'You have already timed in for today.' });
        }

        // 2. Insert new record
        await pool.query(
            'INSERT INTO attendance (user_id, date, time_in, status) VALUES (?, CURDATE(), CURTIME(), "Present")',
            [user_id]
        );

        res.status(201).json({ message: 'Time In recorded successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error during Time In.' });
    }
};

export const timeOut = async (req: Request, res: Response) => {
    const { user_id } = req.body;

    try {
        // 1. Find the active session for today
        const [activeSession]: any = await pool.query(
            'SELECT id FROM attendance WHERE user_id = ? AND date = CURDATE() AND time_out IS NULL',
            [user_id]
        );

        if (activeSession.length === 0) {
            return res.status(404).json({ message: 'No active Time In found for today.' });
        }

        // 2. Update the record with Time Out
        await pool.query(
            'UPDATE attendance SET time_out = CURTIME() WHERE id = ?',
            [activeSession[0].id]
        );

        res.status(200).json({ message: 'Time Out recorded successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error during Time Out.' });
    }
};