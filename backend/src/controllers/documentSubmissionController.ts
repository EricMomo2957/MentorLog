import { Request, Response } from 'express';
import db from '../config/db'; 
import fs from 'fs'; // Required to delete the physical file from storage
import path from 'path';

export const submitDocument = async (req: Request, res: Response) => {
    try {
        const { student_id, student_name, document_type } = req.body;
        const file_path = req.file?.path;

        if (!file_path) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const sql = "INSERT INTO document_submissions (student_id, student_name, document_type, file_path) VALUES (?, ?, ?, ?)";
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

// --- NEW: EDIT DOCUMENT METADATA ---
export const editDocument = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { document_type } = req.body;

        const sql = "UPDATE document_submissions SET document_type = ? WHERE id = ?";
        await db.query(sql, [document_type, id]);

        return res.json({ message: "Document type updated successfully" });
    } catch (err) {
        console.error("Edit Error:", err);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

// --- NEW: DELETE DOCUMENT & PHYSICAL FILE ---
export const deleteDocument = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // 1. Get the file path first so we can delete the physical file
        const [rows]: any = await db.query("SELECT file_path FROM document_submissions WHERE id = ?", [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ message: "Document not found" });
        }

        const filePath = rows[0].file_path;

        // 2. Delete the record from the Database
        await db.query("DELETE FROM document_submissions WHERE id = ?", [id]);

        // 3. Delete the physical file from the 'uploads' folder
        if (filePath) {
            fs.unlink(path.resolve(filePath), (err) => {
                if (err) console.error("File Deletion Error:", err);
            });
        }

        return res.json({ message: "Submission and file deleted successfully" });
    } catch (err) {
        console.error("Delete Error:", err);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};