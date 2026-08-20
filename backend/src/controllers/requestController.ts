import { Response } from 'express';
import db from '../config/db';
import { AuthRequest } from '../middleware/authMiddleware';
import { logAction } from '../utils/logger';

type RequestStatus = 'Pending' | 'Processing' | 'Accepted' | 'Rejected';

/**
 * 1. Submit Request (Student Side)
 */
export const submitRequest = async (req: AuthRequest, res: Response) => {
    const { subject, message, urgency } = req.body;
    
    // Extract identity safely
    const studentId = req.user?.id; 
    const studentName = (req.user as any)?.full_name || "Unknown Student"; 

    if (!subject || !message) {
        return res.status(400).json({ success: false, message: "Subject and message are required" });
    }

    try {
        const query = `
            INSERT INTO service_requests (student_id, student_name, subject, message, urgency, status) 
            VALUES (?, ?, ?, ?, ?, 'Pending')
        `;
        
        await db.execute(query, [
            studentId, 
            studentName, 
            subject, 
            message, 
            urgency || 'Normal'
        ]);

        await logAction(studentId, 'CREATE', 'Service Requests', `Submitted request: ${subject}`);
        
        res.status(201).json({ success: true, message: "Request submitted successfully" });
    } catch (error) {
        console.error("Submission Error:", error);
        res.status(500).json({ success: false, message: "Database error", error });
    }
};

/**
 * 2. Get All Requests (Admin Side)
 */
export const getAllRequests = async (_req: AuthRequest, res: Response) => {
    try {
        const [rows] = await db.execute(`
            SELECT sr.*, u.profile_pic 
            FROM service_requests sr 
            LEFT JOIN users u ON sr.student_id = u.id 
            ORDER BY sr.created_at DESC
        `);
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        console.error("Fetch Error:", error);
        res.status(500).json({ success: false, message: "Error fetching data", error });
    }
};

import { createNotification } from './notificationController';

/**
 * 3. Update Status (Admin Side)
 */
export const updateRequestStatus = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { status } = req.body as { status: RequestStatus };

    if (!status) {
        return res.status(400).json({ success: false, message: "Status is required" });
    }

    try {
        const [reqRows]: any = await db.execute("SELECT student_id, subject FROM service_requests WHERE id = ?", [id]);

        const query = "UPDATE service_requests SET status = ? WHERE id = ?";
        const [result]: any = await db.execute(query, [status, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Request not found" });
        }

        if (reqRows.length > 0) {
            const studentId = reqRows[0].student_id;
            const subject = reqRows[0].subject;
            await createNotification(
                studentId, 
                "Service Request Status Updated", 
                `Your service request "${subject}" status was updated to: ${status}`, 
                status === 'Accepted' ? 'success' : status === 'Rejected' ? 'error' : 'info'
            );
        }

        await logAction(req.user?.id, 'UPDATE', 'Service Requests', `Set request #${id} status to ${status}`);

        res.status(200).json({ success: true, message: `Request status updated to ${status}` });
    } catch (error) {
        console.error("Update Error:", error);
        res.status(500).json({ success: false, message: "Update failed", error });
    }
};

/**
 * 4. Get Student's Own Requests (Student Side)
 * Fixed to match your specific DB column 'student_id'
 */
export const getMyRequests = async (req: AuthRequest, res: Response) => {
    try {
        const studentId = req.user?.id; 

        if (!studentId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        // Note: I used 'student_id' to match your INSERT query above. 
        // If your table uses 'user_id', change the string below.
        const [rows] = await db.execute(
            'SELECT * FROM service_requests WHERE student_id = ? ORDER BY created_at DESC',
            [studentId] 
        );

        res.status(200).json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error("Internal Query Error:", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};