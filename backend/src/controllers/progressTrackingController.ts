import { Request, Response } from 'express';
import db from '../config/db'; // Adjust based on your DB config path

export const getInternsProgress = async (req: Request, res: Response) => {
    try {
        // APPLY THE SELECT QUERY HERE
        const query = `
            SELECT 
                u.id AS student_id,
                u.full_name, 
                u.required_hours, 
                COALESCE(SUM(ml.hours_rendered), 0) AS total_hours_rendered,
                MAX(ml.date) AS latest_log_date
            FROM users u
            LEFT JOIN mentor_logs ml ON u.id = ml.student_id
            WHERE u.role = 'intern'
            GROUP BY u.id, u.full_name, u.required_hours;
        `;

        const [results]: any = await db.execute(query);

        // Map the results to include status logic for the AdminProgressTracker.tsx
        const formattedData = results.map((row: any) => {
            const progress = (row.total_hours_rendered / row.required_hours) * 100;
            
            return {
                ...row,
                status: progress >= 100 ? 'Completed' : progress < 30 ? 'At Risk' : 'On Track'
            };
        });

        res.status(200).json(formattedData);
    } catch (error) {
        console.error("Database Error:", error);
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

