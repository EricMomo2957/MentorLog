import express from 'express';
import { timeIn, timeOut } from '../controllers/attendanceController';

const router = express.Router();

router.post('/time-in', timeIn);
router.post('/time-out', timeOut);

export default router;