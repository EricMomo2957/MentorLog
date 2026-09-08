import express from 'express';
import { 
    submitJournal, 
    getMyJournals, 
    getAllJournals, 
    reviewJournal, 
    deleteJournal 
} from '../controllers/journalController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/submit', protect, submitJournal);
router.get('/my-journals', protect, getMyJournals);
router.get('/all', protect, getAllJournals);
router.put('/review/:id', protect, reviewJournal);
router.delete('/:id', protect, deleteJournal);

export default router;
