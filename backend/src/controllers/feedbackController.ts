import { Request, Response } from 'express';
import db from '../config/db';
import { AuthRequest } from '../middleware/authMiddleware';

/**
 * STUDENT LOGIC
 */
export const submitFeedback = async (req: AuthRequest, res: Response) => {
    const { category, content, rating } = req.body;
    const studentId = req.user?.id;
    const studentName = (req.user as any)?.full_name || "Anonymous Student";

    if (!category || !content || !rating) {
        return res.status(400).json({ success: false, message: "All fields are required" });
    }

    try {
        const query = `
            INSERT INTO feedbacks (student_id, student_name, category, content, rating) 
            VALUES (?, ?, ?, ?, ?)
        `;
        await db.execute(query, [studentId, studentName, category, content, rating]);
        res.status(201).json({ success: true, message: "Feedback submitted. Thank you!" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Database error", error });
    }
};

/**
 * ADMIN LOGIC
 */
export const getAllFeedback = async (_req: AuthRequest, res: Response) => {
    try {
        const [rows] = await db.execute('SELECT * FROM feedbacks ORDER BY created_at DESC');
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching feedback" });
    }
};

export const deleteFeedback = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    try {
        await db.execute('DELETE FROM feedbacks WHERE id = ?', [id]);
        res.status(200).json({ success: true, message: "Feedback removed" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Delete failed" });
    }
};