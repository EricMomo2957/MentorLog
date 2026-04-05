import express from 'express';
import { 
    addEvent, 
    getEvents, 
    updateEvent, 
    deleteEvent // Added this import
} from '../controllers/eventController';

import { getUserEvents, updateUserEvent, deleteUserEvent} from '../controllers/eventController';

const router = express.Router();

router.get('/user/:userId', getUserEvents);
router.post('/add', addEvent);
// --- POST: Create a new event ---
router.post('/add', addEvent);
router.put('/user/update/:id', updateUserEvent);
router.delete('/user/delete/:id/:userId', deleteUserEvent);

// --- GET: Fetch all events ---
router.get('/', getEvents);

// --- PUT: Update an event by ID ---
router.put('/:id', updateEvent); 

// --- DELETE: Remove an event by ID ---
router.delete('/:id', deleteEvent); 


export default router;