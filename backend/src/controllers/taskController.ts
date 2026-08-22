import { Request, Response } from 'express';
import pool from '../config/db';
import { logAction } from '../utils/logger';
import { createNotification } from './notificationController';
import fs from 'fs';
import path from 'path';

interface AuthRequest extends Request {
    user?: {
        id: number;
        role: string;
        full_name?: string;
    };
}

/**
 * 1. Submit a Task Report (Self-submission by Student)
 */
export const submitTask = async (req: AuthRequest, res: Response) => {
    const { task_description, title } = req.body;
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        await pool.query(
            'INSERT INTO tasks (user_id, title, task_description, status, due_date) VALUES (?, ?, ?, "Pending", CURDATE())',
            [userId, title || 'Daily Task Report', task_description]
        );

        await logAction(userId, 'CREATE', 'Task Directives', `Submitted daily task report: ${title || 'Daily Task Report'}`);

        res.status(201).json({ message: 'Task report submitted successfully!' });
    } catch (error) {
        console.error("Error in submitTask:", error);
        res.status(500).json({ message: 'Error submitting task report.' });
    }
};

/**
 * 2. Get Tasks for the Logged-in Student (Personal View)
 */
export const getMyTasks = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const [rows] = await pool.query(
            'SELECT * FROM tasks WHERE user_id = ? ORDER BY due_date DESC',
            [userId]
        );
        res.status(200).json(rows);
    } catch (error) {
        console.error("Error in getMyTasks:", error);
        res.status(500).json({ message: 'Error fetching your tasks.' });
    }
};

/**
 * 3. Get All Tasks (Admin/Mentor View)
 */
export const getAllTasks = async (req: Request, res: Response) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                t.id, 
                t.user_id,
                t.title,
                t.task_description, 
                t.status,
                t.due_date, 
                t.attachment_url,
                t.attachment_name,
                u.full_name as student_name,
                u.profile_pic 
            FROM tasks t
            JOIN users u ON t.user_id = u.id
            ORDER BY t.id DESC
        `);
        
        res.status(200).json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error("Error in getAllTasks:", error);
        res.status(500).json({ success: false, message: 'Error fetching task logs.' });
    }
};

/**
 * 4. General Task Fetching
 */
export const getTasks = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    
    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const [rows] = await pool.query(
            'SELECT * FROM tasks WHERE user_id = ? ORDER BY id DESC',
            [userId]
        );
        res.status(200).json(rows);
    } catch (error) {
        console.error("Error in getTasks:", error);
        res.status(500).json({ message: 'Error fetching tasks.' });
    }
};

/**
 * 5. Admin Assigns a Task to a Specific Student (Supports Photo & Document Attachment)
 */
export const assignTask = async (req: AuthRequest, res: Response) => {
    const { student_id, user_id, title, task_description, due_date } = req.body;
    const targetUserId = student_id || user_id;

    const attachmentUrl = req.file ? `/uploads/tasks/${req.file.filename}` : null;
    const attachmentName = req.file ? req.file.originalname : null;

    if (!targetUserId || (!title && !task_description)) {
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        return res.status(400).json({ success: false, message: 'Student ID and Task details are required.' });
    }

    try {
        await pool.query(
            'INSERT INTO tasks (user_id, title, task_description, status, due_date, attachment_url, attachment_name) VALUES (?, ?, ?, "Pending", ?, ?, ?)',
            [targetUserId, title || 'New Assignment', task_description || '', due_date || new Date(), attachmentUrl, attachmentName]
        );

        await createNotification(
            targetUserId, 
            "New OJT Task Assigned", 
            `You have been assigned a new task: "${title || 'New Assignment'}".`, 
            'info'
        );

        await logAction(req.user?.id || null, 'CREATE', 'Task Directives', `Assigned task "${title || 'New Assignment'}" to student ID #${targetUserId}`);

        res.status(201).json({ success: true, message: 'Task assigned to student successfully!' });
    } catch (error) {
        console.error("Error in assignTask:", error);
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({ success: false, message: 'Error assigning task.' });
    }
};

/**
 * 6. Update Task (Admin/Mentor, Supports Updating Attachments)
 */
export const updateTask = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { title, task_description, due_date, status, user_id, student_id } = req.body;
    const rawUserId = user_id || student_id;
    const targetUserId = rawUserId && !isNaN(Number(rawUserId)) ? Number(rawUserId) : null;

    try {
        let attachmentUrl = null;
        let attachmentName = null;

        if (req.file) {
            attachmentUrl = `/uploads/tasks/${req.file.filename}`;
            attachmentName = req.file.originalname;
        }

        if (req.file) {
            if (targetUserId) {
                await pool.query(
                    'UPDATE tasks SET title = ?, task_description = ?, due_date = ?, status = ?, user_id = ?, attachment_url = ?, attachment_name = ? WHERE id = ?',
                    [title, task_description, due_date, status || 'Pending', targetUserId, attachmentUrl, attachmentName, id]
                );
            } else {
                await pool.query(
                    'UPDATE tasks SET title = ?, task_description = ?, due_date = ?, status = ?, attachment_url = ?, attachment_name = ? WHERE id = ?',
                    [title, task_description, due_date, status || 'Pending', attachmentUrl, attachmentName, id]
                );
            }
        } else {
            if (targetUserId) {
                await pool.query(
                    'UPDATE tasks SET title = ?, task_description = ?, due_date = ?, status = ?, user_id = ? WHERE id = ?',
                    [title, task_description, due_date, status || 'Pending', targetUserId, id]
                );
            } else {
                await pool.query(
                    'UPDATE tasks SET title = ?, task_description = ?, due_date = ?, status = ? WHERE id = ?',
                    [title, task_description, due_date, status || 'Pending', id]
                );
            }
        }

        await logAction(req.user?.id || null, 'UPDATE', 'Task Directives', `Updated task directive #${id}: ${title}`);

        res.status(200).json({ success: true, message: 'Task updated successfully.' });
    } catch (error) {
        console.error("Error in updateTask:", error);
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({ success: false, message: 'Error updating task.' });
    }
};

/**
 * 7. Update Task Status (Student / Admin)
 */
export const updateTaskStatus = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { status, task_id } = req.body;
    const targetId = id || task_id;

    if (!targetId || !status) {
        return res.status(400).json({ success: false, message: 'Task ID and status are required.' });
    }

    try {
        await pool.query(
            'UPDATE tasks SET status = ? WHERE id = ?',
            [status, targetId]
        );

        await logAction(req.user?.id || null, 'UPDATE', 'Task Directives', `Set task #${targetId} status to ${status}`);

        res.status(200).json({ success: true, message: 'Task status updated successfully.' });
    } catch (error) {
        console.error("Error in updateTaskStatus:", error);
        res.status(500).json({ message: 'Error updating task status.' });
    }
};

/**
 * 8. Delete Task (Admin/Mentor)
 */
export const deleteTask = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    try {
        const [rows]: any = await pool.query('SELECT attachment_url FROM tasks WHERE id = ?', [id]);
        if (rows.length > 0 && rows[0].attachment_url) {
            const filePath = path.join(__dirname, '../../', rows[0].attachment_url);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }

        await pool.query('DELETE FROM tasks WHERE id = ?', [id]);

        await logAction(req.user?.id || null, 'DELETE', 'Task Directives', `Deleted task directive #${id}`);

        res.status(200).json({ success: true, message: 'Task deleted successfully.' });
    } catch (error) {
        console.error("Error in deleteTask:", error);
        res.status(500).json({ success: false, message: 'Error deleting task.' });
    }
};