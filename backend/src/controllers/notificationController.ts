import { Response } from 'express';
import db from '../config/db';
import { AuthRequest } from '../middleware/authMiddleware';

/**
 * Helper utility to create a notification for a user
 */
export const createNotification = async (userId: number, title: string, message: string, type: string = 'info') => {
    try {
        await db.execute(
            `CREATE TABLE IF NOT EXISTS notifications (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                title VARCHAR(255) NOT NULL,
                message TEXT NOT NULL,
                type VARCHAR(50) DEFAULT 'info',
                is_read TINYINT(1) DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`
        );

        await db.execute(
            `INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)`,
            [userId, title, message, type]
        );
    } catch (err) {
        console.error("Error creating notification:", err);
    }
};

/**
 * GET /api/notifications
 * Fetch notifications for current logged in user
 */
export const getMyNotifications = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ message: "Not authorized" });

        await db.execute(
            `CREATE TABLE IF NOT EXISTS notifications (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                title VARCHAR(255) NOT NULL,
                message TEXT NOT NULL,
                type VARCHAR(50) DEFAULT 'info',
                is_read TINYINT(1) DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`
        );

        const [rows]: any = await db.execute(
            `SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 30`,
            [userId]
        );

        const unreadCount = rows.filter((n: any) => !n.is_read).length;

        res.json({
            success: true,
            data: rows,
            unreadCount
        });
    } catch (error) {
        console.error("Fetch Notifications Error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch notifications" });
    }
};

/**
 * PUT /api/notifications/:id/read
 * Mark a single notification as read
 */
export const markAsRead = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ message: "Not authorized" });

        await db.execute(
            `UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?`,
            [id, userId]
        );

        res.json({ success: true, message: "Notification marked as read" });
    } catch (error) {
        console.error("Mark Read Error:", error);
        res.status(500).json({ success: false, message: "Error updating notification" });
    }
};

/**
 * PUT /api/notifications/read-all
 * Mark all notifications as read for current user
 */
export const markAllAsRead = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ message: "Not authorized" });

        await db.execute(
            `UPDATE notifications SET is_read = 1 WHERE user_id = ?`,
            [userId]
        );

        res.json({ success: true, message: "All notifications marked as read" });
    } catch (error) {
        console.error("Mark All Read Error:", error);
        res.status(500).json({ success: false, message: "Error updating notifications" });
    }
};
