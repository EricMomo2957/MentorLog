import express from 'express';
import { 
    addEvent, 
    getEvents, 
    updateEvent, 
    deleteEvent // Added this import
} from '../controllers/eventController';

const router = express.Router();

// --- POST: Create a new event ---
router.post('/add', addEvent);

// --- GET: Fetch all events ---
router.get('/', getEvents);

// --- PUT: Update an event by ID ---
router.put('/:id', updateEvent); 

// --- DELETE: Remove an event by ID ---
router.delete('/:id', deleteEvent); 


export default router;