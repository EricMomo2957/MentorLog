import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key';

// 1. Enhanced interface to match your database/logic
interface DecodedToken {
    id: number;
    role: string; // Made this required to ensure role-based routes work
}

/**
 * Refined 'protect' middleware
 * Checks for Bearer token and attaches user data to request
 */
export const protect = async (req: any, res: Response, next: NextFunction) => {
    let token;
    
    // Check for Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;

            // IMPORTANT: Attach decoded data to req.user
            // We use .toLowerCase() here as a safety measure if needed in controllers
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

// You can keep verifyToken as a legacy/simple helper, 
// but 'protect' is better for your current route setup.
export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
    const token = req.header('Authorization')?.split(' ')[1];

    if (!token) {
        return res.status(403).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        (req as any).user = decoded; 
        next(); 
    } catch (error) {
        res.status(401).json({ message: 'Invalid or expired token.' });
    }
};