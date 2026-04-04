import { Request, Response } from 'express';
import db from '../config/db';

/**
 * POST: Create a new event
 * Path: /api/events/add
 */
export const addEvent = async (req: Request, res: Response) => {
    const { title, description, location, start_time, end_time, user_id } = req.body;

    // Helpful for debugging the "user_id cannot be null" error
    console.log("Payload received by Backend:", req.body);

    // Validation: user_id and title are mandatory for the DB
    if (!user_id) {
        return res.status(400).json({ 
            success: false, 
            message: "user_id is missing from request" 
        });
    }

    if (!title) {
        return res.status(400).json({ 
            success: false, 
            message: "title is missing from request" 
        });
    }

    try {
        const query = `
            INSERT INTO events (user_id, title, description, location, start_time, end_time) 
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        // We use || '' to provide default empty strings for optional fields
        await db.execute(query, [
            user_id, 
            title, 
            description || '', 
            location || '', 
            start_time, 
            end_time || start_time // Default end_time to start_time if missing
        ]);
        
        // CRITICAL: This JSON response tells the Frontend Axios call that everything worked.
        return res.status(201).json({ 
            success: true, 
            message: "Event created" 
        });

    } catch (error) {
        console.error("Database Error:", error);
        return res.status(500).json({ 
            success: false, 
            error: "Internal Server Error" 
        });
    }
};

/**
 * GET: Fetch all events
 * Path: /api/events
 */
export const getEvents = async (_req: Request, res: Response) => {
    try {
        // We use destructuring [rows] because mysql2 returns an array: [rows, fields]
        const [rows] = await db.execute('SELECT * FROM events ORDER BY start_time ASC');
        
        // Return the rows directly so the frontend .map() function works
        return res.status(200).json(rows);
        
    } catch (error) {
        console.error("Fetch Error:", error);
        return res.status(500).json({ 
            success: false,
            error: 'Failed to fetch events' 
        });
    }
};