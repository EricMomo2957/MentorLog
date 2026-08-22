import { Request, Response } from 'express';
import db from '../config/db'; 
import fs from 'fs'; 
import path from 'path';
import { logAction } from '../utils/logger';
import { notifyAdmins, createNotification } from './notificationController';

export const submitDocument = async (req: Request, res: Response) => {
    try {
        const { student_id, student_name, document_type } = req.body;
        const file_path = req.file?.path;

        if (!file_path) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const sql = "INSERT INTO document_submissions (student_id, student_name, document_type, file_path) VALUES (?, ?, ?, ?)";
        await db.query(sql, [student_id, student_name, document_type, file_path]);

        await logAction(Number(student_id) || null, 'CREATE', 'Document Vault', `Uploaded ${document_type} file: ${req.file?.originalname || 'Document'}`);
        
        await notifyAdmins(
            'New Document Submission',
            `${student_name || 'An OJT Student'} submitted a document: ${document_type}`,
            'info'
        );

        return res.status(201).json({ message: "Document submitted successfully!" });
    } catch (err) {
        console.error("Submission Error:", err);
        return res.status(500).json({ message: "Internal Server Error", error: err });
    }
};

export const getAllSubmissions = async (req: Request, res: Response) => {
    try {
        const sql = `
            SELECT ds.*, u.profile_pic 
            FROM document_submissions ds 
            LEFT JOIN users u ON ds.student_id = u.id 
            ORDER BY ds.submitted_at DESC
        `;
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

        const [subRows]: any = await db.query("SELECT student_id, document_type FROM document_submissions WHERE id = ?", [id]);
        if (subRows && subRows.length > 0) {
            await createNotification(
                subRows[0].student_id,
                'Document Status Update',
                `Your submission for "${subRows[0].document_type}" has been updated to "${status}".`,
                status?.toLowerCase() === 'approved' ? 'success' : 'warning'
            );
        }

        await logAction((req as any).user?.id || null, 'UPDATE', 'Document Vault', `Updated submission #${id} status to ${status}`);
        
        return res.json({ message: "Submission updated" });
    } catch (err) {
        console.error("Update Error:", err);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const editDocument = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { document_type } = req.body;

        const sql = "UPDATE document_submissions SET document_type = ? WHERE id = ?";
        await db.query(sql, [document_type, id]);

        await logAction((req as any).user?.id || null, 'UPDATE', 'Document Vault', `Modified document type for #${id} to ${document_type}`);

        return res.json({ message: "Document type updated successfully" });
    } catch (err) {
        console.error("Edit Error:", err);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const deleteDocument = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const [rows]: any = await db.query("SELECT file_path FROM document_submissions WHERE id = ?", [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ message: "Document not found" });
        }

        const filePath = rows[0].file_path;

        await db.query("DELETE FROM document_submissions WHERE id = ?", [id]);

        if (filePath) {
            fs.unlink(path.resolve(filePath), (err) => {
                if (err) console.error("File Deletion Error:", err);
            });
        }

        await logAction((req as any).user?.id || null, 'DELETE', 'Document Vault', `Deleted submission #${id}`);

        return res.json({ message: "Submission and file deleted successfully" });
    } catch (err) {
        console.error("Delete Error:", err);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};