import { Response } from 'express';
import db from '../config/db';
import { AuthRequest } from '../middleware/authMiddleware'; // Import your custom type

type RequestStatus = 'Pending' | 'Processing' | 'Accepted' | 'Rejected';

// 1. Submit Request (Student Side)
export const submitRequest = async (req: AuthRequest, res: Response) => {
    // We can now pull student_id safely from the token if we want, 
    // but using req.body works as long as it's sent from the frontend.
    const { student_id, student_name, subject, message } = req.body;

    try {
        const query = `
            INSERT INTO service_requests (student_id, student_name, subject, message) 
            VALUES (?, ?, ?, ?)
        `;
        await db.execute(query, [student_id, student_name, subject, message]);
        res.status(201).json({ message: "Request submitted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Database error", error });
    }
};

// 2. Get All Requests (Admin Side)
export const getAllRequests = async (req: AuthRequest, res: Response) => {
    try {
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

    try {
        const query = "UPDATE service_requests SET status = ? WHERE id = ?";
        await db.execute(query, [status, id]);
        res.status(200).json({ message: `Request status updated to ${status}` });
    } catch (error) {
        res.status(500).json({ message: "Update failed", error });
    }
};