import { Request, Response, NextFunction } from 'express';

/**
 * Middleware factory to enforce required fields in req.body
 */
export const requireFields = (fields: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const missing = fields.filter(field => {
            const val = req.body[field];
            return val === undefined || val === null || val === '';
        });

        if (missing.length > 0) {
            return res.status(400).json({
                message: `Missing required field(s): ${missing.join(', ')}`,
                missingFields: missing
            });
        }
        next();
    };
};

/**
 * Middleware to sanitize string inputs in req.body
 */
export const sanitizeInputs = (req: Request, _res: Response, next: NextFunction) => {
    if (req.body && typeof req.body === 'object') {
        Object.keys(req.body).forEach(key => {
            if (typeof req.body[key] === 'string') {
                req.body[key] = req.body[key].trim();
            }
        });
    }
    next();
};
