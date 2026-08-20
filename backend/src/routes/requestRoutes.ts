import { Router } from 'express';
import { 
    getAllRequests, 
    updateRequestStatus, 
    submitRequest,
    getMyRequests
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
router.get('/my-requests', protect, studentOnly, getMyRequests);

/**
 * @route   GET /api/requests/all
 * @desc    Admin fetches all requests
 * @access  Private (Admin Only)
 */
router.get('/all', protect, adminOnly, getAllRequests);

/**
 * @route   PUT /api/requests/:id/status
 * @route   PATCH /api/requests/:id/status
 * @desc    Admin updates status of a request
 * @access  Private (Admin Only)
 */
router.put('/:id/status', protect, adminOnly, updateRequestStatus);
router.patch('/:id/status', protect, adminOnly, updateRequestStatus);

export default router;