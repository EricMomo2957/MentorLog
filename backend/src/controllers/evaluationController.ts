import { Response } from 'express';
import db from '../config/db';
import { AuthRequest } from '../middleware/authMiddleware';
import { logAction } from '../utils/logger';
import { createNotification } from './notificationController';

/**
 * Ensures 'evaluations' table exists in database
 */
// Evaluation Controller for MentorLog

/**
 * ADMIN: Submit or Update Student Evaluation (Midterm or Final)
 */
export const submitEvaluation = async (req: AuthRequest, res: Response) => {
    const evaluatorId = req.user?.id;
    const { 
        student_id, 
        evaluation_type, 
        professionalism, 
        technical_skills, 
        punctuality, 
        communication, 
        comments 
    } = req.body;

    if (!student_id || !evaluation_type || !evaluatorId) {
        return res.status(400).json({ success: false, message: "Student ID and Evaluation Type are required" });
    }

    const p = Math.min(5, Math.max(1, Number(professionalism) || 5));
    const t = Math.min(5, Math.max(1, Number(technical_skills) || 5));
    const pu = Math.min(5, Math.max(1, Number(punctuality) || 5));
    const c = Math.min(5, Math.max(1, Number(communication) || 5));

    const overallScore = Number(((p + t + pu + c) / 4).toFixed(2));

    try {
        // Check if evaluation already exists for this student and type
        const [existing]: any = await db.execute(
            'SELECT id FROM evaluations WHERE student_id = ? AND evaluation_type = ?',
            [student_id, evaluation_type]
        );

        if (existing && existing.length > 0) {
            // Update Existing Evaluation
            const evalId = existing[0].id;
            await db.execute(
                `UPDATE evaluations 
                 SET evaluator_id = ?, professionalism = ?, technical_skills = ?, punctuality = ?, communication = ?, overall_score = ?, comments = ?
                 WHERE id = ?`,
                [evaluatorId, p, t, pu, c, overallScore, comments || '', evalId]
            );

            await logAction(evaluatorId, 'UPDATE', 'Student Evaluation', `Updated ${evaluation_type} evaluation for student #${student_id} (Score: ${overallScore}/5)`);
            
            await createNotification(
                Number(student_id),
                `${evaluation_type} Evaluation Updated`,
                `Your supervisor updated your ${evaluation_type} evaluation scorecard. Overall Grade: ${overallScore}/5`,
                'info'
            );

            return res.status(200).json({ success: true, message: `${evaluation_type} Evaluation updated successfully!` });
        } else {
            // Insert New Evaluation
            await db.execute(
                `INSERT INTO evaluations 
                 (student_id, evaluator_id, evaluation_type, professionalism, technical_skills, punctuality, communication, overall_score, comments)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [student_id, evaluatorId, evaluation_type, p, t, pu, c, overallScore, comments || '']
            );

            await logAction(evaluatorId, 'CREATE', 'Student Evaluation', `Submitted ${evaluation_type} evaluation for student #${student_id} (Score: ${overallScore}/5)`);

            await createNotification(
                Number(student_id),
                `New ${evaluation_type} Evaluation Submitted`,
                `Your supervisor submitted your ${evaluation_type} evaluation scorecard. Overall Grade: ${overallScore}/5`,
                'info'
            );

            return res.status(201).json({ success: true, message: `${evaluation_type} Evaluation submitted successfully!` });
        }
    } catch (error: any) {
        console.error("Evaluation Submission Error:", error);
        res.status(500).json({ success: false, message: "Database error processing evaluation", error: error.message });
    }
};

/**
 * STUDENT: Get Own Evaluation Scorecards
 */
export const getMyEvaluations = async (req: AuthRequest, res: Response) => {
    const studentId = req.user?.id;
    if (!studentId) {
        return res.status(401).json({ success: false, message: "Unauthorized access" });
    }

    try {
        const [rows]: any = await db.execute(
            `SELECT e.*, u.full_name as evaluator_name 
             FROM evaluations e
             LEFT JOIN users u ON e.evaluator_id = u.id
             WHERE e.student_id = ? 
             ORDER BY e.created_at DESC`,
            [studentId]
        );

        res.status(200).json({ success: true, data: rows });
    } catch (error: any) {
        res.status(500).json({ success: false, message: "Failed to fetch evaluation scorecards", error: error.message });
    }
};

/**
 * ADMIN: Get Specific Student Evaluations
 */
export const getStudentEvaluations = async (req: AuthRequest, res: Response) => {
    const { studentId } = req.params;

    try {
        const [rows]: any = await db.execute(
            `SELECT e.*, u.full_name as evaluator_name, s.full_name as student_name, s.student_id as student_number, s.course
             FROM evaluations e
             LEFT JOIN users u ON e.evaluator_id = u.id
             LEFT JOIN users s ON e.student_id = s.id
             WHERE e.student_id = ? 
             ORDER BY e.created_at DESC`,
            [studentId]
        );

        res.status(200).json({ success: true, data: rows });
    } catch (error: any) {
        res.status(500).json({ success: false, message: "Failed to fetch student evaluations", error: error.message });
    }
};

/**
 * ADMIN: Get All Evaluations across all students
 */
export const getAllEvaluations = async (_req: AuthRequest, res: Response) => {
    try {
        const [rows]: any = await db.execute(
            `SELECT e.*, u.full_name as evaluator_name, s.full_name as student_name, s.student_id as student_number, s.course
             FROM evaluations e
             LEFT JOIN users u ON e.evaluator_id = u.id
             LEFT JOIN users s ON e.student_id = s.id
             ORDER BY e.created_at DESC`
        );

        res.status(200).json({ success: true, data: rows });
    } catch (error: any) {
        res.status(500).json({ success: false, message: "Failed to fetch all evaluations", error: error.message });
    }
};
