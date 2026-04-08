import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key';

// 1. Define the User interface
interface DecodedToken {
    id: number;
    role: string;
}

// 2. Extend the Express Request interface to recognize req.user
export interface AuthRequest extends Request {
    user?: {
        id: number;
        role: string;
    };
}

/**
 * Protect Middleware
 * Checks for Bearer token and attaches user data to request
 */
export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;

            // Attach user to request
            // .toLowerCase() ensures "Admin" or "ADMIN" matches our "admin" logic
            req.user = {
                id: decoded.id,
                role: decoded.role.toLowerCase()
            };

            return next();
        } catch (error) {
            console.error("Token verification error:", error);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token provided' });
    }
};

/**
 * Admin Only Middleware
 * Checks if the user has the 'admin' role
 */
export const adminOnly = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ 
            message: 'Access denied: You do not have permission to access this resource.' 
        });
    }
};

/**
 * Student Only Middleware
 * Useful for student-specific routes like submitting requests
 */
export const studentOnly = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.user && req.user.role === 'student') {
        next();
    } else {
        res.status(403).json({ 
            message: 'Access denied: Students only.' 
        });
    }
};

/**
 * Legacy Support Alias
 * This fixes the error in taskRoutes.ts and other files still 
 * importing 'verifyToken'.
 */
export const verifyToken = protect;