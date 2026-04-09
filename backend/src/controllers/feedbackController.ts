import { Request, Response } from 'express';
import db from '../config/db'; // Adjust based on your DB config path

export const getAllFeedbacks = async (req: Request, res: Response) => {
    try {
        const query = `
            SELECT f.*, u.full_name as student_name 
            FROM feedbacks f 
            JOIN users u ON f.student_id = u.id 
            ORDER BY f.created_at DESC
        `;
        const [rows] = await db.execute(query);
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching feedback", error });
    }
};

export const submitFeedback = async (req: Request, res: Response) => {
    const { student_id, subject, comment, rating, category } = req.body;
    try {
        const query = `INSERT INTO feedbacks (student_id, subject, comment, rating, category) VALUES (?, ?, ?, ?, ?)`;
        await db.execute(query, [student_id, subject, comment, rating, category]);
        res.status(201).json({ success: true, message: "Feedback submitted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Submission failed", error });
    }
};