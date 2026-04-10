// src/controllers/announcementController.ts
import { Response } from 'express';
import db from '../config/db';
import { AuthRequest } from '../middleware/authMiddleware';
import fs from 'fs';
import path from 'path';

/**
 * 1. Create Announcement (Admin Only)
 * Handles text data and the uploaded file path from Multer
 */
export const createAnnouncement = async (req: AuthRequest, res: Response) => {
    const { title, content } = req.body;
    const adminId = req.user?.id;
    
    // req.file is populated by Multer in the routes file
    const imageUrl = req.file ? `/uploads/announcements/${req.file.filename}` : null;

    if (!title || !content) {
        // If validation fails, delete the uploaded file to save space
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        return res.status(400).json({ success: false, message: "Title and content are required" });
    }

    try {
        const query = `
            INSERT INTO announcements (title, content, image_url, admin_id) 
            VALUES (?, ?, ?, ?)
        `;
        
        await db.execute(query, [
            title, 
            content, 
            imageUrl, 
            adminId
        ]);
        
        res.status(201).json({ 
            success: true, 
            message: "Announcement published successfully!" 
        });
    } catch (error) {
        console.error("Announcement Error:", error);
        
        // Clean up uploaded file if DB insertion fails
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }

        res.status(500).json({ 
            success: false, 
            message: "Failed to save announcement to database" 
        });
    }
};

/**
 * 2. Get All Announcements (Public/Student/Admin)
 */
export const getAnnouncements = async (_req: AuthRequest, res: Response) => {
    try {
        const query = 'SELECT * FROM announcements ORDER BY created_at DESC';
        const [rows] = await db.execute(query);
        
        res.status(200).json({ 
            success: true, 
            data: rows 
        });
    } catch (error) {
        console.error("Fetch Error:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error fetching announcements" 
        });
    }
};

/**
 * 3. Delete Announcement (Admin Only)
 */
export const deleteAnnouncement = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    try {
        // First, get the image URL so we can delete the file from the disk
        const [rows]: any = await db.execute('SELECT image_url FROM announcements WHERE id = ?', [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: "Announcement not found" });
        }

        const imageUrl = rows[0].image_url;

        // Delete the database entry
        await db.execute('DELETE FROM announcements WHERE id = ?', [id]);

        // If there was an image, delete it from the physical 'uploads' folder
        if (imageUrl) {
            const filePath = path.join(__dirname, '../../', imageUrl);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        res.status(200).json({ success: true, message: "Announcement and associated image deleted" });
    } catch (error) {
        console.error("Delete Error:", error);
        res.status(500).json({ success: false, message: "Failed to delete announcement" });
    }
};