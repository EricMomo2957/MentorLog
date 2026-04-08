import { Response } from 'express';
import db from '../config/db';
import { AuthRequest } from '../middleware/authMiddleware';

type RequestStatus = 'Pending' | 'Processing' | 'Accepted' | 'Rejected';

// 1. Submit Request (Student Side)
export const submitRequest = async (req: AuthRequest, res: Response) => {
    // 1. Pull urgency from body
    // 2. Use req.user?.id from the token instead of trusting the frontend body for student_id
    const { student_name, subject, message, urgency } = req.body;
    const studentIdFromToken = req.user?.id; 

    if (!subject || !message) {
        return res.status(400).json({ message: "Subject and message are required" });
    }

    try {
        const query = `
            INSERT INTO service_requests (student_id, student_name, subject, message, urgency) 
            VALUES (?, ?, ?, ?, ?)
        `;
        // Use studentIdFromToken for better security
        await db.execute(query, [studentIdFromToken, student_name, subject, message, urgency || 'Normal']);
        
        res.status(201).json({ message: "Request submitted successfully" });
    } catch (error) {
        console.error("Submission Error:", error);
        res.status(500).json({ message: "Database error", error });
    }
};

// 2. Get All Requests (Admin Side)
export const getAllRequests = async (_req: AuthRequest, res: Response) => {
    try {
        // Fetching urgency and status so Admin can sort/filter
        const [rows] = await db.execute('SELECT * FROM service_requests ORDER BY created_at DESC');
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ message: "Error fetching data", error });
    }
};

// 3. Update Status (Admin Side)
export const updateRequestStatus = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { status } = req.body as { status: RequestStatus };

    if (!status) {
        return res.status(400).json({ message: "Status is required" });
    }

    try {
        const query = "UPDATE service_requests SET status = ? WHERE id = ?";
        const [result]: any = await db.execute(query, [status, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Request not found" });
        }

        res.status(200).json({ message: `Request status updated to ${status}` });
    } catch (error) {
        res.status(500).json({ message: "Update failed", error });
    }
};