// src/controllers/announcementController.ts
import { Response } from 'express';
import db from '../config/db';
import { AuthRequest } from '../middleware/authMiddleware';
import fs from 'fs';
import path from 'path';
import { logAction } from '../utils/logger';

/**
 * 1. Create Announcement (Admin Only)
 */
export const createAnnouncement = async (req: AuthRequest, res: Response) => {
    const { title, content } = req.body;
    const adminId = req.user?.id;
    
    const imageUrl = req.file ? `/uploads/announcements/${req.file.filename}` : null;

    if (!title || !content) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(400).json({ success: false, message: "Title and content are required" });
    }

    try {
        const query = `
            INSERT INTO announcements (title, content, image_url, admin_id) 
            VALUES (?, ?, ?, ?)
        `;
        
        await db.execute(query, [title, content, imageUrl, adminId]);

        // --- LOG THE ACTION ---
        await logAction(
            adminId!, 
            'CREATE', 
            'Announcements', 
            `Published new announcement: ${title}`
        );
        
        res.status(201).json({ success: true, message: "Announcement published successfully!" });
    } catch (error) {
        console.error("Announcement Error:", error);
        if (req.file) fs.unlinkSync(req.file.path);
        res.status(500).json({ success: false, message: "Failed to save announcement" });
    }
};

/**
 * 2. Get All Announcements
 */
export const getAnnouncements = async (_req: AuthRequest, res: Response) => {
    try {
        const query = 'SELECT * FROM announcements ORDER BY created_at DESC';
        const [rows] = await db.execute(query);
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching announcements" });
    }
};

/**
 * 3. Delete Announcement (Admin Only)
 */
export const deleteAnnouncement = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const adminId = req.user?.id;

    try {
        const [rows]: any = await db.execute('SELECT title, image_url FROM announcements WHERE id = ?', [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: "Announcement not found" });
        }

        const { title, image_url: imageUrl } = rows[0];

        await db.execute('DELETE FROM announcements WHERE id = ?', [id]);

        if (imageUrl) {
            const filePath = path.join(__dirname, '../../', imageUrl);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }

        // --- LOG THE ACTION ---
        await logAction(
            adminId!, 
            'DELETE', 
            'Announcements', 
            `Removed announcement: ${title}`
        );

        res.status(200).json({ success: true, message: "Announcement deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to delete announcement" });
    }
};

/**
 * 4. Update Announcement (Admin Only)
 */
export const updateAnnouncement = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { title, content } = req.body;
    const adminId = req.user?.id;

    try {
        const [rows]: any = await db.execute('SELECT image_url FROM announcements WHERE id = ?', [id]);
        if (rows.length === 0) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(404).json({ success: false, message: "Announcement not found" });
        }

        const oldImageUrl = rows[0].image_url;
        let newImageUrl = oldImageUrl;

        if (req.file) {
            newImageUrl = `/uploads/announcements/${req.file.filename}`;
            if (oldImageUrl) {
                const oldPath = path.join(__dirname, '../../', oldImageUrl);
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }
        }

        const query = `
            UPDATE announcements 
            SET title = ?, content = ?, image_url = ? 
            WHERE id = ?
        `;
        
        await db.execute(query, [title, content, newImageUrl, id]);

        // --- LOG THE ACTION ---
        await logAction(
            adminId!, 
            'UPDATE', 
            'Announcements', 
            `Modified announcement: ${title}`
        );

        res.status(200).json({ success: true, message: "Announcement updated successfully" });
    } catch (error) {
        if (req.file) fs.unlinkSync(req.file.path);
        res.status(500).json({ success: false, message: "Failed to update announcement" });
    }
};