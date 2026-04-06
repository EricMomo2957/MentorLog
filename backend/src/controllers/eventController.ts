// backend/src/controllers/eventController.ts
import { Request, Response } from 'express';
import db from '../config/db';
import { ResultSetHeader } from 'mysql2';
/**
 * POST: Create a new event
 */
export const addEvent = async (req: Request, res: Response) => {
    const { title, description, location, start_time, end_time, user_id } = req.body;

    if (!user_id || !title) {
        return res.status(400).json({ success: false, message: "Missing user_id or title" });
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
        ] as any); // Use 'as any' to satisfy TS overload check
        
        return res.status(201).json({ success: true, message: "Event created" });
    } catch (error) {
        console.error("Database Error (Add):", error);
        return res.status(500).json({ success: false, error: "Internal Server Error" });
    }
};

/**
 * GET: Fetch events ONLY for the logged-in user
 */
export const getEvents = async (req: Request, res: Response) => {
    const { user_id } = req.query; 

    if (!user_id) {
        return res.status(400).json({ success: false, message: "user_id is required" });
    }

    try {
        const query = 'SELECT * FROM events WHERE user_id = ? ORDER BY start_time ASC';
        const [rows] = await db.execute(query, [user_id] as any);
        return res.status(200).json(rows);
    } catch (error) {
        console.error("Fetch Error:", error);
        return res.status(500).json({ success: false, error: 'Failed to fetch events' });
    }
};

/**
 * PUT: Update an existing event (Owner check included)
 */
export const updateEvent = async (req: Request, res: Response) => {
    const { id } = req.params; 
    const { title, description, location, start_time, end_time, user_id } = req.body;

    if (!user_id) return res.status(400).json({ success: false, message: "User ID missing" });

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
        ] as any);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Not found or permission denied" });
        }
        return res.status(200).json({ success: true, message: "Updated successfully" });
    } catch (error) {
        console.error("Update Error:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

/**
 * DELETE: Remove an event (Owner check included)
 */
export const deleteEvent = async (req: Request, res: Response) => {
    const { id } = req.params;
    
    // If you are NOT using JWT, you'd usually pass user_id in the query 
    // or body. For now, let's make it robust to avoid TS errors.
    const user_id = req.query.user_id as string | undefined; 

    try {
        let query: string;
        let params: any[];

        if (user_id) {
            // Option A: Secure delete (checks if user owns the event)
            query = 'DELETE FROM events WHERE id = ? AND user_id = ?';
            params = [id, user_id];
        } else {
            // Option B: Direct delete (Admin style)
            // Use this if your frontend isn't sending user_id in the DELETE request
            query = 'DELETE FROM events WHERE id = ?';
            params = [id];
        }

        // We cast to ResultSetHeader to get access to .affectedRows without 'any'
        const [result] = await db.execute<ResultSetHeader>(query, params);

        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: "Event not found or unauthorized" 
            });
        }

        return res.status(200).json({ 
            success: true, 
            message: "Deleted successfully" 
        });

    } catch (error: unknown) {
        console.error("Delete Error:", error);
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