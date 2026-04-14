import { Request, Response } from 'express';
import db from '../config/db';

export const getAllQuestions = async (req: Request, res: Response) => {
    try {
        const [rows] = await db.execute(`
            SELECT q.*, u.full_name as student_name 
            FROM intern_questions q
            JOIN users u ON q.student_id = u.id
            ORDER BY q.created_at DESC
        `);
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ message: "Error fetching questions" });
    }
};

export const getConversation = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const [replies] = await db.execute(
            `SELECT * FROM question_replies WHERE question_id = ? ORDER BY created_at ASC`,
            [id]
        );
        res.status(200).json(replies);
    } catch (error) {
        res.status(500).json({ message: "Error fetching conversation" });
    }
};

export const adminReply = async (req: Request, res: Response) => {
    const { question_id, admin_id, reply_text } = req.body;
    try {
        // 1. Insert the reply into the thread
        await db.execute(
            `INSERT INTO question_replies (question_id, sender_id, sender_role, reply_text) VALUES (?, ?, 'admin', ?)`,
            [question_id, admin_id, reply_text]
        );

        // 2. Update main question status to 'replied'
        await db.execute(
            `UPDATE intern_questions SET status = 'replied' WHERE id = ?`,
            [question_id]
        );

        res.status(200).json({ message: "Reply sent successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to send reply" });
    }
};

// Add this to your Controller to handle ANY reply (Admin or Intern)
export const postReply = async (req: Request, res: Response) => {
    const { question_id, sender_id, sender_role, reply_text } = req.body;
    try {
        await db.execute(
            `INSERT INTO question_replies (question_id, sender_id, sender_role, reply_text) VALUES (?, ?, ?, ?)`,
            [question_id, sender_id, sender_role, reply_text]
        );

        // If intern replies, set status back to 'pending' for admin to see
        // If admin replies, set status to 'replied'
        const newStatus = sender_role === 'intern' ? 'pending' : 'replied';
        await db.execute(
            `UPDATE intern_questions SET status = ? WHERE id = ?`,
            [newStatus, question_id]
        );

        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ message: "Reply failed" });
    }
};