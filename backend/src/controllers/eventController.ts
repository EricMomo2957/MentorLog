import { Request, Response } from 'express';
import db from '../config/db';

// backend/src/controllers/eventController.ts
export const addEvent = async (req: Request, res: Response) => {
    const { title, description, location, start_time, end_time, user_id } = req.body;

    // Log this! If user_id shows up as 'undefined' here, the problem is 100% frontend.
    console.log("Payload received by Backend:", req.body);

    if (!user_id) {
        return res.status(400).json({ 
            success: false, 
            message: "user_id is missing from request" 
        });
    }

    try {
        const query = `
            INSERT INTO events (user_id, title, description, location, start_time, end_time) 
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        // Use ?? for default values to prevent null errors on optional fields
        await db.execute(query, [
            user_id, 
            title, 
            description || '', 
            location || '', 
            start_time, 
            end_time
        ]);
        
        res.status(201).json({ success: true });
    } catch (error) {
        console.error("Database Error:", error);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
};
export const getEvents = async (_req: Request, res: Response) => {
    try {
        const [rows] = await db.execute('SELECT * FROM events ORDER BY start_time ASC');
        res.status(200).json(rows);
    } catch (error) {
        console.error("Fetch Error:", error);
        res.status(500).json({ error: 'Failed to fetch events' });
    }
};