import { Request, Response } from 'express';
import db from '../config/db';
import { logAction } from '../utils/logger';
import { notifyAdmins, createNotification } from './notificationController';

export const submitJournal = async (req: Request, res: Response) => {
    try {
        const studentId = (req as any).user?.id || req.body.student_id;
        const studentName = (req as any).user?.full_name || 'OJT Student';
        const {
            week_number,
            start_date,
            end_date,
            total_hours_rendered,
            tasks_completed,
            skills_acquired,
            challenges_and_solutions,
            plan_next_week,
            attachment_url
        } = req.body;

        if (!week_number || !start_date || !end_date || !tasks_completed) {
            return res.status(400).json({ success: false, message: "Week number, dates, and completed tasks are required." });
        }

        // Check if journal already exists for this week by this student
        const [existing]: any = await db.query(
            "SELECT id FROM weekly_journals WHERE student_id = ? AND week_number = ?",
            [studentId, week_number]
        );

        if (existing && existing.length > 0) {
            const journalId = existing[0].id;
            await db.query(
                `UPDATE weekly_journals SET 
                    start_date = ?, end_date = ?, total_hours_rendered = ?, 
                    tasks_completed = ?, skills_acquired = ?, challenges_and_solutions = ?, 
                    plan_next_week = ?, attachment_url = ?, status = 'Submitted' 
                WHERE id = ?`,
                [
                    start_date, end_date, total_hours_rendered || 0,
                    tasks_completed, skills_acquired || null, challenges_and_solutions || null,
                    plan_next_week || null, attachment_url || null, journalId
                ]
            );

            await logAction(studentId, 'UPDATE', 'Weekly Journal', `Updated Week #${week_number} Accomplishment Journal`);
            return res.json({ success: true, message: `Week #${week_number} Journal updated successfully!` });
        }

        const sql = `
            INSERT INTO weekly_journals 
                (student_id, week_number, start_date, end_date, total_hours_rendered, tasks_completed, skills_acquired, challenges_and_solutions, plan_next_week, attachment_url, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Submitted')
        `;

        await db.query(sql, [
            studentId, week_number, start_date, end_date, total_hours_rendered || 0,
            tasks_completed, skills_acquired || null, challenges_and_solutions || null,
            plan_next_week || null, attachment_url || null
        ]);

        await logAction(studentId, 'CREATE', 'Weekly Journal', `Submitted Week #${week_number} Accomplishment Journal`);

        await notifyAdmins(
            'New Weekly Journal Entry',
            `${studentName} submitted their Week #${week_number} Accomplishment Journal for review.`,
            'info'
        );

        return res.status(201).json({ success: true, message: `Week #${week_number} Accomplishment Journal submitted!` });
    } catch (err) {
        console.error("Submit Journal Error:", err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const getMyJournals = async (req: Request, res: Response) => {
    try {
        const studentId = (req as any).user?.id;
        if (!studentId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const sql = `
            SELECT id, student_id, week_number, start_date, end_date, total_hours_rendered,
                   tasks_completed, skills_acquired, challenges_and_solutions, plan_next_week,
                   attachment_url, status, mentor_feedback, mentor_rating, submitted_at, reviewed_at
            FROM weekly_journals
            WHERE student_id = ?
            ORDER BY week_number DESC
        `;

        const [results] = await db.query(sql, [studentId]);
        return res.json({ success: true, data: results });
    } catch (err) {
        console.error("Get My Journals Error:", err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const getAllJournals = async (req: Request, res: Response) => {
    try {
        const sql = `
            SELECT wj.*, u.full_name as student_name, u.student_id as student_number, u.course, u.school_name, u.profile_pic
            FROM weekly_journals wj
            LEFT JOIN users u ON wj.student_id = u.id
            ORDER BY wj.submitted_at DESC
        `;

        const [results] = await db.query(sql);
        return res.json({ success: true, data: results });
    } catch (err) {
        console.error("Get All Journals Error:", err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const reviewJournal = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status, mentor_feedback, mentor_rating } = req.body;

        const sql = `
            UPDATE weekly_journals 
            SET status = ?, mentor_feedback = ?, mentor_rating = ?, reviewed_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;

        await db.query(sql, [status || 'Approved', mentor_feedback || null, mentor_rating || null, id]);

        const [journalRows]: any = await db.query(
            "SELECT student_id, week_number FROM weekly_journals WHERE id = ?",
            [id]
        );

        if (journalRows && journalRows.length > 0) {
            await createNotification(
                journalRows[0].student_id,
                'Weekly Journal Reviewed',
                `Your Week #${journalRows[0].week_number} Accomplishment Journal has been ${status === 'Approved' ? 'Approved' : 'Reviewed with Feedback'}.`,
                status === 'Approved' ? 'success' : 'info'
            );
        }

        await logAction((req as any).user?.id || null, 'UPDATE', 'Weekly Journal', `Reviewed Journal #${id} (Status: ${status})`);

        return res.json({ success: true, message: "Journal review recorded successfully" });
    } catch (err) {
        console.error("Review Journal Error:", err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const deleteJournal = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await db.query("DELETE FROM weekly_journals WHERE id = ?", [id]);
        await logAction((req as any).user?.id || null, 'DELETE', 'Weekly Journal', `Deleted journal entry #${id}`);
        return res.json({ success: true, message: "Journal deleted successfully" });
    } catch (err) {
        console.error("Delete Journal Error:", err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};
