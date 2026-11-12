const express = require('express');
const router = express.Router();
const providerController = require('../controllers/providerController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Public search for customers
router.get('/nearby', providerController.getNearbyProviders);
router.get('/:id', providerController.getProviderById);

// Provider authenticated actions
router.use(authenticateToken);
router.use(authorizeRoles('provider', 'admin'));

router.get('/dashboard/stats', providerController.getProviderDashboard);
router.get('/dashboard/requests', providerController.getProviderRequests);
router.patch('/availability', providerController.updateAvailability);
router.patch('/location', providerController.updateLocation);

module.exports = router;
