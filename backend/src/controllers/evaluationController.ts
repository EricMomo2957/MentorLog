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

/**
 * GET Final OJT Grade Computation & Practicum Summary Sheet
 * Accessible by both Student (own summary) and Admin/Mentor (by studentId)
 */
export const getFinalGradeSummary = async (req: AuthRequest, res: Response) => {
    const studentId = req.params.studentId || req.user?.id;

    if (!studentId) {
        return res.status(400).json({ success: false, message: "Student ID is required." });
    }

    try {
        // 1. Fetch Student User Details
        const [userRows]: any = await db.execute(
            'SELECT id, full_name, email, student_id, course, company_name, required_hours, profile_pic FROM users WHERE id = ?',
            [studentId]
        );

        if (!userRows || userRows.length === 0) {
            return res.status(404).json({ success: false, message: "Student record not found." });
        }
        const student = userRows[0];
        const requiredHours = Number(student.required_hours) || 600;

        // 2. Fetch Attendance Summary (Approved hours only)
        const [attRows]: any = await db.execute(`
            SELECT 
                COALESCE(SUM(CASE WHEN approval_status = 'Approved' OR approval_status IS NULL THEN total_hours ELSE 0 END), 0) as total_hours,
                COUNT(CASE WHEN status = 'Present' THEN 1 END) as present_days,
                COUNT(CASE WHEN status = 'Late' THEN 1 END) as late_days,
                COUNT(CASE WHEN status = 'Absent' THEN 1 END) as absent_days,
                MIN(date) as start_date,
                MAX(date) as end_date
            FROM attendance
            WHERE user_id = ?
        `, [studentId]);

        const att = attRows[0] || {};
        const totalRenderedHours = Number(att.total_hours) || 0;
        const attendancePercentage = Math.min(100, (totalRenderedHours / requiredHours) * 100);
        // Attendance grade component (Max 40 points)
        const attendanceScore = parseFloat(((attendancePercentage / 100) * 40).toFixed(2));

        // 3. Fetch Evaluations (Midterm & Final)
        const [evalRows]: any = await db.execute(
            'SELECT * FROM evaluations WHERE student_id = ? ORDER BY evaluation_type ASC',
            [studentId]
        );

        let midtermScore: number | null = null;
        let finalScore: number | null = null;
        let evaluatorName: string = 'Company Supervisor';

        (evalRows || []).forEach((ev: any) => {
            if (ev.evaluation_type === 'Midterm') midtermScore = Number(ev.overall_score);
            if (ev.evaluation_type === 'Final') finalScore = Number(ev.overall_score);
        });

        // Compute Evaluation average out of 5.0
        let avgEvalOutOf5 = 0;
        if (midtermScore !== null && finalScore !== null) {
            avgEvalOutOf5 = (midtermScore + finalScore) / 2;
        } else if (finalScore !== null) {
            avgEvalOutOf5 = finalScore;
        } else if (midtermScore !== null) {
            avgEvalOutOf5 = midtermScore;
        }

        // Mentor Evaluation grade component (Max 40 points)
        const evaluationScore = parseFloat(((avgEvalOutOf5 / 5) * 40).toFixed(2));

        // 4. Fetch Tasks & Submissions
        const [taskRows]: any = await db.execute(`
            SELECT 
                COUNT(*) as total_tasks,
                COUNT(CASE WHEN status = 'Completed' THEN 1 END) as completed_tasks
            FROM tasks
            WHERE user_id = ?
        `, [studentId]);

        const totalTasks = Number(taskRows[0]?.total_tasks) || 0;
        const completedTasks = Number(taskRows[0]?.completed_tasks) || 0;
        const taskCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 100;
        // Task / Journal Deliverables component (Max 20 points)
        const taskScore = parseFloat(((taskCompletionRate / 100) * 20).toFixed(2));

        // 5. Final Grade Computation
        const finalNumericalGrade = parseFloat((attendanceScore + evaluationScore + taskScore).toFixed(2));

        // Academic Equivalent Grade (Philippine University Grading Scale)
        let academicGrade = '1.00 (Excellent)';
        if (finalNumericalGrade >= 97) academicGrade = '1.00 (Passed with Highest Honors)';
        else if (finalNumericalGrade >= 94) academicGrade = '1.25 (Superior)';
        else if (finalNumericalGrade >= 91) academicGrade = '1.50 (Very Good)';
        else if (finalNumericalGrade >= 88) academicGrade = '1.75 (Good)';
        else if (finalNumericalGrade >= 85) academicGrade = '2.00 (Satisfactory)';
        else if (finalNumericalGrade >= 80) academicGrade = '2.25 (Fair)';
        else if (finalNumericalGrade >= 75) academicGrade = '3.00 (Passing)';
        else academicGrade = '5.00 (Failed / Incomplete)';

        res.status(200).json({
            success: true,
            data: {
                student: {
                    id: student.id,
                    full_name: student.full_name,
                    student_number: student.student_id,
                    course: student.course,
                    email: student.email,
                    company_name: student.company_name,
                    profile_pic: student.profile_pic,
                    required_hours: requiredHours,
                    rendered_hours: totalRenderedHours,
                    is_completed: totalRenderedHours >= requiredHours
                },
                breakdown: {
                    attendance: {
                        weight: '40%',
                        max_points: 40,
                        earned_points: attendanceScore,
                        hours_logged: totalRenderedHours,
                        required_hours: requiredHours,
                        percentage: parseFloat(attendancePercentage.toFixed(1)),
                        present_days: Number(att.present_days) || 0,
                        late_days: Number(att.late_days) || 0,
                        absent_days: Number(att.absent_days) || 0,
                        start_date: att.start_date,
                        end_date: att.end_date
                    },
                    evaluations: {
                        weight: '40%',
                        max_points: 40,
                        earned_points: evaluationScore,
                        midterm_score: midtermScore,
                        final_score: finalScore,
                        average_rating: parseFloat(avgEvalOutOf5.toFixed(2))
                    },
                    tasks_and_deliverables: {
                        weight: '20%',
                        max_points: 20,
                        earned_points: taskScore,
                        total_tasks: totalTasks,
                        completed_tasks: completedTasks,
                        completion_rate: parseFloat(taskCompletionRate.toFixed(1))
                    }
                },
                final_numerical_grade: finalNumericalGrade,
                academic_grade_equivalent: academicGrade,
                is_eligible_for_certificate: totalRenderedHours >= requiredHours,
                generated_at: new Date().toISOString()
            }
        });
    } catch (error: any) {
        console.error("Error generating final grade summary:", error);
        res.status(500).json({ success: false, message: "Failed to generate grade summary.", error: error.message });
    }
};
