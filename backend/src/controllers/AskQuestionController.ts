import { Request, Response } from 'express';
import db from '../config/db';
import { createNotification, notifyAdmins } from './notificationController';

export const getAllQuestions = async (req: Request, res: Response) => {
    try {
        const [rows] = await db.execute(`
            SELECT q.*, u.full_name as student_name 
            FROM intern_questions q
            JOIN users u ON q.student_id = u.id
            ORDER BY q.created_at DESC
        `);
        res.status(200).json(rows);
    } catch (error: unknown) {
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
    } catch (error: unknown) {
        res.status(500).json({ message: "Error fetching conversation" });
    }
};

export const askQuestion = async (req: Request, res: Response) => {
    const { student_id, subject, message } = req.body;
    try {
        await db.execute(
            `INSERT INTO intern_questions (student_id, subject, message, status) VALUES (?, ?, ?, 'pending')`,
            [student_id, subject, message]
        );

        const [uRows]: any = await db.execute('SELECT full_name FROM users WHERE id = ?', [student_id]);
        const sName = (uRows && uRows[0]?.full_name) || 'An OJT Student';
        await notifyAdmins('New Student Inquiry', `${sName} sent a question: "${subject}"`, 'info');

        res.status(201).json({ success: true, message: "Question submitted successfully" });
    } catch (error: unknown) {
        console.error(error);
        res.status(500).json({ message: "Error submitting question" });
    }
};

// Unified Reply Function to avoid confusion
export const postReply = async (req: Request, res: Response) => {
    const { question_id, sender_id, sender_role, reply_text } = req.body;
    try {
        // Ensure all required fields exist
        if (!question_id || !sender_id || !sender_role || !reply_text) {
             res.status(400).json({ message: "Missing required fields" });
             return;
        }

        await db.execute(
            `INSERT INTO question_replies (question_id, sender_id, sender_role, reply_text) VALUES (?, ?, ?, ?)`,
            [question_id, sender_id, sender_role, reply_text]
        );

        const newStatus = sender_role === 'intern' ? 'pending' : 'replied';
        await db.execute(
            `UPDATE intern_questions SET status = ? WHERE id = ?`,
            [newStatus, question_id]
        );

        if (sender_role === 'intern') {
            const [qRows]: any = await db.execute(
                'SELECT q.subject, u.full_name FROM intern_questions q JOIN users u ON q.student_id = u.id WHERE q.id = ?',
                [question_id]
            );
            const sName = (qRows && qRows[0]?.full_name) || 'An OJT Student';
            const subj = (qRows && qRows[0]?.subject) || 'Inquiry';
            await notifyAdmins('New Reply from Student', `${sName} replied on thread: "${subj}"`, 'info');
        } else {
            const [qRows]: any = await db.execute(
                'SELECT student_id, subject FROM intern_questions WHERE id = ?',
                [question_id]
            );
            if (qRows && qRows.length > 0) {
                await createNotification(
                    qRows[0].student_id,
                    'New Reply from Admin',
                    `An admin replied to your question: "${qRows[0].subject}"`,
                    'info'
                );
            }
        }

        res.status(200).json({ success: true });
    } catch (error: unknown) {
        const err = error as Error;
        console.error("Reply Error:", err.message);
        res.status(500).json({ message: "Reply failed", error: err.message });
    }
};

export const getQuestionsByStudent = async (req: Request, res: Response) => {
    const { student_id } = req.params; 
    try {
        const [rows] = await db.execute(
            `SELECT * FROM intern_questions WHERE student_id = ? ORDER BY created_at DESC`,
            [student_id]
        );
        res.status(200).json(rows);
    } catch (error: unknown) {
        const err = error as Error;
        console.error("Database Error:", err.message);
        res.status(500).json({ message: "Server Error" });
    }
};

export const deleteQuestion = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        // 1. Delete associated replies first (Foreign Key constraint safety)
        await db.execute(`DELETE FROM question_replies WHERE question_id = ?`, [id]);
        
        // 2. Delete the main question
        await db.execute(`DELETE FROM intern_questions WHERE id = ?`, [id]);

        res.status(200).json({ success: true, message: "Deleted successfully" });
    } catch (error: unknown) {
        const err = error as Error;
        console.error("Delete Error:", err.message);
        res.status(500).json({ message: "Server Error during deletion" });
    }
};

export const updateReply = async (req: Request, res: Response) => {
    const { id } = req.params; // This is the reply ID
    const { reply_text } = req.body;

    try {
        if (!reply_text) {
            res.status(400).json({ message: "Reply text is required" });
            return;
        }

        const [result]: any = await db.execute(
            `UPDATE question_replies SET reply_text = ? WHERE id = ?`,
            [reply_text, id]
        );

        if (result.affectedRows === 0) {
            res.status(404).json({ message: "Reply not found" });
            return;
        }

        res.status(200).json({ success: true, message: "Reply updated" });
    } catch (error: unknown) {
        const err = error as Error;
        console.error("Update Error:", err.message);
        res.status(500).json({ message: "Server Error during update" });
    }
};