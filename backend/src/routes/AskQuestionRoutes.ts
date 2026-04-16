import express from 'express';
import { 
    askQuestion, 
    getAllQuestions, 
    getConversation, 
    postReply,
    getQuestionsByStudent,
    deleteQuestion,
    updateReply
} from '../controllers/AskQuestionController';

const router = express.Router();

/**
 * --- STUDENT ROUTES ---
 */

// Route for students to submit a new question
router.post('/ask', askQuestion);

// Get all questions filtered by a specific student ID
// This is used for the Student Dashboard's "My Inquiries" section
router.get('/student/:student_id', getQuestionsByStudent);

// Get the full message thread (all replies) for a specific question ID
router.get('/thread/:id', getConversation);

// Route for both students and admins to add to the reply thread
router.post('/reply', postReply);

router.delete('/delete/:id', deleteQuestion);

router.put('/reply/:id', updateReply);

/**
 * --- ADMIN / MANAGEMENT ROUTES ---
 */

// Get every question in the system (for the Inbox sidebar)
router.get('/all', getAllQuestions);

export default router;