import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key';

// Define the shape of your JWT payload
interface DecodedToken {
    id: number;
    role?: string;
}

// This is your current verification function
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

/**
 * Refined 'protect' middleware
 * This ensures the token is valid before allowing access to Admin/Student routes
 */
export const protect = async (req: any, res: Response, next: NextFunction) => {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];

            // Verify token and cast to our interface
            const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;

            // Attach to request
            req.user = decoded;

            return next(); // Use return to ensure no further execution
        } catch (error) {
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};