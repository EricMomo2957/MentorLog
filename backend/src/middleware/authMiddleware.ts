import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key';

// 1. Updated interface to include full_name for JWT decoding
interface DecodedToken {
    id: number;
    role: string;
    full_name: string; 
}

// 2. Updated Express Request extension to recognize full_name in controllers
export interface AuthRequest extends Request {
    user?: {
        id: number;
        role: string;
        full_name: string; 
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

            // Verify token and cast to our DecodedToken interface
            const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;

            // Attach user to request
            // CRITICAL: full_name is assigned here so req.user.full_name works in requestController
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
 * Admin Only Middleware
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
 * Maintains compatibility with files using verifyToken
 */
export const verifyToken = protect;