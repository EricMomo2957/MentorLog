import { Request, Response } from 'express';
import pool from '../config/db';

/**
 * GET /api/admin/forgot-password-requests
 * Fetch all student password reset requests for the Admin table
 */
export const getForgotPasswordRequests = async (req: Request, res: Response) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM password_resets ORDER BY status ASC, requested_at DESC'
        );
        res.status(200).json(rows);
    } catch (error) {
        console.error("Fetch Requests Error:", error);
        res.status(500).json({ message: 'Error fetching requests' });
    }
};

/**
 * PUT /api/admin/resolve-password/:id
 * Mark a specific request as resolved
 */
export const resolvePasswordRequest = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const [result]: any = await pool.query(
            'UPDATE password_resets SET status = ? WHERE id = ?', 
            ['resolved', id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Request not found' });
        }

        res.status(200).json({ message: 'Request marked as resolved' });
    } catch (error) {
        console.error("Resolve Request Error:", error);
        res.status(500).json({ message: 'Error updating request' });
    }
};