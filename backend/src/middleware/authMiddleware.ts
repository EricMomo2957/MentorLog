import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
    // Get token from header (format: Bearer <token>)
    const token = req.header('Authorization')?.split(' ')[1];

    if (!token) {
        return res.status(403).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_super_secret_key');
        (req as any).user = decoded; // Attach user info to the request
        next(); // Move to the next function (the controller)
    } catch (error) {
        res.status(401).json({ message: 'Invalid or expired token.' });
    }
};