const express = require('express');
const router = express.Router();
const {
    getDashboardStats,
    getAllOrders,
    updateOrderStatus,
    getAllCustomers,
    getAllPayments,
    deleteUser
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/stats').get(protect, admin, getDashboardStats);
router.route('/orders').get(protect, admin, getAllOrders);
router.route('/orders/:id/status').patch(protect, admin, updateOrderStatus);
router.route('/customers').get(protect, admin, getAllCustomers);
router.route('/customers/:id').delete(protect, admin, deleteUser);
router.route('/payments').get(protect, admin, getAllPayments);

module.exports = router;
