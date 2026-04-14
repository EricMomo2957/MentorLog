import express from 'express';
import { getAllQuestions, getConversation, adminReply } from '../controllers/AskQuestionController';

const router = express.Router();

// Get list of all questions from students
router.get('/all', getAllQuestions);

// Get the specific thread of a question
router.get('/thread/:id', getConversation);

// Post a new reply
router.post('/reply', adminReply);

export default router;