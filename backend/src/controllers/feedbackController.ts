import { Response } from 'express';
import db from '../config/db';
import { AuthRequest } from '../middleware/authMiddleware';
import { logAction } from '../utils/logger';

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

        await logAction(studentId, 'CREATE', 'Student Feedback', `Submitted program feedback (Rating: ${rating}/5, Category: ${category})`);

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
        const [rows] = await db.execute(`
            SELECT f.*, u.profile_pic 
            FROM feedbacks f 
            LEFT JOIN users u ON f.student_id = u.id 
            ORDER BY f.created_at DESC
        `);
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching feedback" });
    }
};

export const deleteFeedback = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    try {
        await db.execute('DELETE FROM feedbacks WHERE id = ?', [id]);

        await logAction(req.user?.id, 'DELETE', 'Student Feedback', `Removed feedback entry #${id}`);

        res.status(200).json({ success: true, message: "Feedback removed" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Delete failed" });
    }
};