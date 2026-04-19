import { Request, Response } from 'express';
import db from '../config/db'; 
import crypto from 'crypto';

const generateRandomCode = (): string => {
    const randomHex = crypto.randomBytes(4).toString('hex').toUpperCase();
    return `ADM-${randomHex}`;
};

export const getAdminCodes = async (req: Request, res: Response) => {
    try {
        const [rows] = await db.execute('SELECT * FROM admin_codes ORDER BY created_at DESC');
        return res.status(200).json(rows);
    } catch (error) {
        console.error("Fetch Codes Error:", error);
        return res.status(500).json({ message: 'Error fetching codes' });
    }
};

/**
 * POST: Create a new unique admin registration code
 */
export const createAdminCode = async (req: Request, res: Response) => {
    const newCode = generateRandomCode();
    
    // 1. Get the ID of the admin currently logged in
    // This assumes your 'protect' middleware attaches the user to req.user
    const adminId = (req as any).user?.id; 

    if (!adminId) {
        return res.status(401).json({ message: 'Unauthorized: Admin ID missing' });
    }
    
    try {
        // 2. Add 'created_by' to the query to match your phpMyAdmin structure
        await db.execute(
            'INSERT INTO admin_codes (code, is_used, created_by) VALUES (?, ?, ?)',
            [newCode, 0, adminId] // 0 for false/tinyint
        );
        
        return res.status(201).json({ 
            success: true, 
            message: 'Code generated successfully', 
            code: newCode 
        });
    } catch (error) {
        console.error("DATABASE ERROR:", error);
        return res.status(500).json({ message: 'Error generating code' });
    }
};

export const deleteAdminCode = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const [result]: any = await db.execute('DELETE FROM admin_codes WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Code not found' });
        }
        return res.status(200).json({ success: true, message: 'Code deleted successfully' });
    } catch (error) {
        console.error("Delete Code Error:", error);
        return res.status(500).json({ message: 'Error deleting code' });
    }
};