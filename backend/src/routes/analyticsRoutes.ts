import { Router, Request } from 'express';
import multer from 'multer';
import { getSystemStats } from '../controllers/analyticsController';
import { protect, adminOnly } from '../middleware/authMiddleware';

const router = Router();

// 1. Multer Configuration (Fixes the "Implicit Any" and callback errors)
const storage = multer.diskStorage({
    destination: (_req: Request, _file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
        cb(null, 'uploads/');
    },
    filename: (_req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

// Initialize multer (if you plan to upload files here, otherwise this can be moved)
const upload = multer({ storage });

// 2. Analytics Route
// This route provides the data for your Pie and Bar charts
router.get('/stats', protect, adminOnly, getSystemStats);

// 3. Named Export (Matches your 'import { analyticsRouter }' in app.ts)
export const analyticsRouter = router;