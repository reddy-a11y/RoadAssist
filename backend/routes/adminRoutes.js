const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.use(authenticateToken);
router.use(authorizeRoles('admin'));

router.get('/analytics', adminController.getDashboardAnalytics);
router.get('/users', adminController.getAllUsers);
router.patch('/users/:id/status', adminController.updateUserStatus);
router.get('/providers', adminController.getAllProviders);
router.patch('/providers/:id/verify', adminController.updateProviderVerification);
router.get('/requests', adminController.getAllRequests);

module.exports = router;
