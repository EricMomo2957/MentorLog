import express from 'express';
import { timeIn, timeOut } from '../controllers/attendanceController';
import { verifyToken } from '../middleware/authMiddleware'; // Import the guard

const router = express.Router();

router.post('/time-in', verifyToken, timeIn);
router.post('/time-out',verifyToken, timeOut);

export default router;