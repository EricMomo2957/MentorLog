import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key';

// Interface for JWT payload decoding
interface DecodedToken {
    id: number;
    role: string;
    full_name: string; 
}

/**
 * 1. EXTENDED AUTH REQUEST INTERFACE
 * Includes 'user' for JWT data and 'file' for Multer (Announcement Photos)
 */
export interface AuthRequest extends Request {
    user?: {
        id: number;
        role: string;
        full_name?: string; 
    };
    file?: any; // Crucial for Multer image uploads
}

/**
 * 2. PROTECT MIDDLEWARE
 * Verifies JWT and populates req.user
 */
export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;

            // Attach user data to request for use in controllers
            req.user = {
                id: decoded.id,
                role: decoded.role.toLowerCase(),
                full_name: decoded.full_name 
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
 * 3. ADMIN ONLY MIDDLEWARE
 */
export const adminOnly = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ 
            message: 'Access denied: Admin privileges required.' 
        });
    }
};

/**
 * 4. STUDENT ONLY MIDDLEWARE
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
 * 5. COMPATIBILITY ALIAS
 */
export const verifyToken = protect;