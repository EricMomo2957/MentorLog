import express from 'express';
import { 
    askQuestion, 
    getAllQuestions, 
    getConversation, 
    postReply,
    getQuestionsByStudent // Add this one for the student's dashboard
} from '../controllers/AskQuestionController';

const router = express.Router();

// --- STUDENT ROUTES ---

// Ask a new question
router.post('/ask', askQuestion);

// Get questions for a specific student (Required for your React useEffect)
// This matches your axios call: /api/questions/student/:studentId
router.get('/student/:student_id', getQuestionsByStudent);

// Get the specific thread (replies) of a question
router.get('/thread/:id', getConversation);

// Post a new reply (shared by Admin and Intern)
router.post('/reply', postReply);


// --- ADMIN ROUTES ---

// Get list of all questions from all students
router.get('/all', getAllQuestions);

export default router;