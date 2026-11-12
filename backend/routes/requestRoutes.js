const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const { authenticateToken } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(authenticateToken);

// Create breakdown request (with optional image)
router.post('/', upload.single('image'), requestController.createRequest);

// Customer requests
router.get('/my', requestController.getCustomerRequests);

// Request details & timeline
router.get('/:id', requestController.getRequestById);

// Update status (provider or admin)
router.patch('/:id/status', requestController.updateRequestStatus);

// Cancel request (customer)
router.patch('/:id/cancel', requestController.cancelRequest);

module.exports = router;
