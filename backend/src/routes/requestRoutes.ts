import { Router } from 'express';
import { 
    getAllRequests, 
    updateRequestStatus, 
    submitRequest,
    getMyRequests // 1. Import the new controller function
} from '../controllers/requestController';
import { protect, adminOnly, studentOnly } from '../middleware/authMiddleware';

const router = Router();

/**
 * @route   POST /api/requests/submit
 * @desc    Student submits a new service request
 * @access  Private (Student Only)
 */
router.post('/submit', protect, studentOnly, submitRequest);

/**
 * @route   GET /api/requests/my-requests
 * @desc    Fetch requests belonging to the logged-in student
 * @access  Private (Student Only)
 */
// 2. Add this route so the frontend table can fetch data
router.get('/my-requests', protect, studentOnly, getMyRequests);

/**
 * @route   GET /api/requests/all
 * @desc    Admin fetches all requests
 * @access  Private (Admin Only)
 */
router.get('/all', protect, adminOnly, getAllRequests);

/**
 * @route   PATCH /api/requests/:id/status
 * @desc    Admin updates status of a request
 * @access  Private (Admin Only)
 */
router.patch('/:id/status', protect, adminOnly, updateRequestStatus);

export default router;