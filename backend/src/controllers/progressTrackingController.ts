import { Request, Response } from 'express';
import db from '../config/db'; // Adjust based on your DB config path

export const getInternsProgress = async (req: Request, res: Response) => {
    try {
        const query = `
            document.SELECT 
                u.id AS student_id,
                u.full_name,
                COALESCE(SUM(ml.hours_rendered), 0) AS total_hours_rendered,
                u.required_hours,
                MAX(ml.date) AS latest_log_date
            FROM users u
            LEFT JOIN mentor_logs ml ON u.id = ml.student_id
            WHERE u.role = 'intern'
            GROUP BY u.id, u.full_name, u.required_hours
        `;

        const [results]: any = await db.execute(query);

        // Process status logic on the server side
        const progressData = results.map((row: any) => {
            const percentage = (row.total_hours_rendered / row.required_hours) * 100;
            let status = 'On Track';
            
            if (percentage >= 100) status = 'Completed';
            else if (percentage < 30) status = 'At Risk'; // Example logic

            return {
                ...row,
                status,
                percentage: Math.min(percentage, 100)
            };
        });

        res.status(200).json(progressData);
    } catch (error) {
        console.error("Error fetching progress:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getIndividualInternLogs = async (req: Request, res: Response) => {
    const { studentId } = req.params;
    try {
        const query = `SELECT * FROM mentor_logs WHERE student_id = ? ORDER BY date DESC`;
        const [logs] = await db.execute(query, [studentId]);
        res.status(200).json(logs);
    } catch (error) {
        res.status(500).json({ message: "Error fetching individual logs" });
    }
};