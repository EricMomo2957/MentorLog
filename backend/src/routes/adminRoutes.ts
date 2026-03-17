import express from 'express';
import { getStudentSummary  } from '../controllers/adminController';
import { verifyToken } from  '../middleware/authMiddleware';

const router = express.Router();

router.get('/dashboard', verifyToken, getStudentSummary);

export default router;