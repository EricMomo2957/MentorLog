import { Request, Response } from 'express';
import db from '../config/db';

export const createEvent = async (req: Request, res: Response) => {
    const { title, description, location, start, end, user_id } = req.body;
    try {
        const query = 'INSERT INTO events (title, description, location, start_time, end_time, created_by) VALUES (?, ?, ?, ?, ?, ?)';
        await db.execute(query, [title, description, location, start, end, user_id]);
        res.status(201).json({ message: 'Event created successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Database error' });
    }
};