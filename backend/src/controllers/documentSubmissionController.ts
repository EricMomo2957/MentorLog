import { Request, Response } from 'express';
import db from '../config/db'; // Ensure this is your mysql2/promise pool

export const submitDocument = async (req: Request, res: Response) => {
    try {
        const { student_id, student_name, document_type } = req.body;
        const file_path = req.file?.path;

        if (!file_path) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const sql = "INSERT INTO document_submissions (student_id, student_name, document_type, file_path) VALUES (?, ?, ?, ?)";
        
        // Use await instead of a callback function
        await db.query(sql, [student_id, student_name, document_type, file_path]);
        
        return res.status(201).json({ message: "Document submitted successfully!" });
    } catch (err) {
        console.error("Submission Error:", err);
        return res.status(500).json({ message: "Internal Server Error", error: err });
    }
};

export const getAllSubmissions = async (req: Request, res: Response) => {
    try {
        const sql = "SELECT * FROM document_submissions ORDER BY submitted_at DESC";
        
        // Destructure the first element (the rows) from the response
        const [results] = await db.query(sql);
        
        return res.json(results);
    } catch (err) {
        console.error("Fetch Error:", err);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const updateSubmissionStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status, feedback } = req.body;
        
        const sql = "UPDATE document_submissions SET status = ?, feedback = ? WHERE id = ?";
        
        await db.query(sql, [status, feedback, id]);
        
        return res.json({ message: "Submission updated" });
    } catch (err) {
        console.error("Update Error:", err);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};