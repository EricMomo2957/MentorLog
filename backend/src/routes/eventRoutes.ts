import express from 'express';
import { addEvent, getEvents } from '../controllers/eventController';
const router = express.Router();

router.post('/add', addEvent);
router.get('/', getEvents);

export default router;