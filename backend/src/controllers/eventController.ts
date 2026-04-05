// backend/src/controllers/eventController.ts
import { Request, Response } from 'express';
import db from '../config/db';

/**
 * POST: Create a new event
 * Path: /api/events/add
 */
export const addEvent = async (req: Request, res: Response) => {
    const { title, description, location, start_time, end_time, user_id } = req.body;

    // Debugging the "user_id cannot be null" issue
    console.log("Payload received by Backend (Add):", req.body);

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

        await db.execute(query, [
            user_id, 
            title, 
            description || '', 
            location || '', 
            start_time, 
            end_time || start_time 
        ]);
        
        return res.status(201).json({ 
            success: true, 
            message: "Event created" 
        });

    } catch (error) {
        console.error("Database Error (Add):", error);
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
        // mysql2 returns [rows, fields]
        const [rows] = await db.execute('SELECT * FROM events ORDER BY start_time ASC');
        
        // Return rows directly so frontend .map() works
        return res.status(200).json(rows);
        
    } catch (error) {
        console.error("Fetch Error:", error);
        return res.status(500).json({ 
            success: false,
            error: 'Failed to fetch events' 
        });
    }
};

/**
 * PUT: Update an existing event
 * Path: /api/events/:id
 */
export const updateEvent = async (req: Request, res: Response) => {
    const { id } = req.params; 
    const { title, description, location, start_time, end_time } = req.body;

    console.log(`Attempting to update event ID: ${id} with:`, req.body);

    if (!title || !start_time) {
        return res.status(400).json({ success: false, message: "Missing required fields." });
    }

    try {
        const query = `
            UPDATE events 
            SET title = ?, description = ?, location = ?, start_time = ?, end_time = ? 
            WHERE id = ?
        `;
        
        const [result]: any = await db.execute(query, [
            title, 
            description || '', 
            location || '', 
            start_time, 
            end_time || start_time, 
            id 
        ]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Event not found." });
        }

        return res.status(200).json({ success: true, message: "Event updated successfully" });

    } catch (error) {
        console.error("Database Update Error:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

/**
 * DELETE: Remove an event
 * Path: /api/events/:id
 */
export const deleteEvent = async (req: Request, res: Response) => {
    const { id } = req.params;

    console.log(`Attempting to delete event ID: ${id}`);

    try {
        const query = 'DELETE FROM events WHERE id = ?';
        const [result]: any = await db.execute(query, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: "Event not found." 
            });
        }

        return res.status(200).json({ 
            success: true, 
            message: "Event deleted successfully" 
        });

    } catch (error) {
        console.error("Database Delete Error:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Internal Server Error" 
        });
    }
};


/**
 * 
 * These functions are for fetching events specific to a Student user, which is useful for the Studentcalendar view.
 * /

/**
 * GET: Fetch events for a specific user
 * Path: /api/events/user/:userId
 */
export const getUserEvents = async (req: Request, res: Response) => {
    const { userId } = req.params;

    try {
        const query = "SELECT * FROM events WHERE user_id = ? ORDER BY start_time ASC";
        
        // Use await db.execute to match the rest of your file
        const [rows] = await db.execute(query, [userId]);

        return res.status(200).json(rows);
        
    } catch (error: any) {
        console.error("Fetch User Events Error:", error);
        return res.status(500).json({ 
            success: false, 
            error: error.message || 'Failed to fetch user events' 
        });
    }
};

/**
 * PUT: Update a specific student's event
 * Ensures the student owns the event before updating
 * Path: /api/events/user/update/:id
 */
export const updateUserEvent = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { title, description, location, start_time, end_time, user_id } = req.body;

    if (!user_id) {
        return res.status(400).json({ success: false, message: "User identity missing." });
    }

    try {
        const query = `
            UPDATE events 
            SET title = ?, description = ?, location = ?, start_time = ?, end_time = ? 
            WHERE id = ? AND user_id = ?
        `;

        const [result]: any = await db.execute(query, [
            title,
            description || '',
            location || '',
            start_time,
            end_time || start_time,
            id,
            user_id
        ]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: "Event not found or you do not have permission to edit it." 
            });
        }

        return res.status(200).json({ success: true, message: "Your event was updated." });

    } catch (error) {
        console.error("Student Update Error:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

/**
 * DELETE: Remove a specific student's event
 * Ensures the student owns the event before deleting
 * Path: /api/events/user/delete/:id/:userId
 */
// Example for deleteUserEvent
export const deleteUserEvent = async (req: Request, res: Response) => {
    const { id, userId } = req.params;

    try {
        const query = 'DELETE FROM events WHERE id = ? AND user_id = ?';
        // ONLY 2 arguments: the query and the array
        const [result]: any = await db.execute(query, [id, userId]); 

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Not found or no permission." });
        }
        return res.status(200).json({ success: true, message: "Deleted." });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};