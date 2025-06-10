const router = require('express').Router();
const orderCtrl = require('../controllers/orderController');
const auth = require('../middleware/auth');
const checkPermission = require('../middleware/permissions');
const checkLicense = require('../middleware/checkLicense');

// Order routes
router.post('/', auth, checkLicense, orderCtrl.createOrder);
router.get('/', auth, checkLicense, orderCtrl.getOrders);
router.put('/:id', auth, checkLicense, checkPermission('edit_orders'), orderCtrl.updateOrderStatus);
router.delete('/:id', auth, checkLicense, checkPermission('edit_orders'), orderCtrl.softDeleteOrder);

router.put('/:id/details', auth, checkLicense, checkPermission('edit_orders'), orderCtrl.updateOrderDetails);
router.get('/:id/comments', auth, checkLicense, orderCtrl.getOrderComments);
router.post('/:id/comments', auth, checkLicense, checkPermission('edit_orders'), orderCtrl.addOrderComment);
router.put('/:id/assign', auth, checkLicense, checkPermission('edit_orders'), orderCtrl.assignManager);

// Manager: hämtar beställningar som är tilldelade till inloggad användare
router.get('/my-tasks', auth, checkLicense, async (req, res) => {
  try {
    const Order = require('../models/Order');
    const tasks = await Order.find({ assignedTo: req.user.id, deleted: false }).populate('assignedTo');
    res.json(tasks);
  } catch (err) {
    console.error('❌ Fel vid hämtning av uppgifter:', err);
    res.status(500).json({ msg: 'Kunde inte hämta uppgifter' });
  }
});

// Notification routes
router.get('/notifications', auth, checkLicense, orderCtrl.getUserNotifications);
router.put('/notifications/read', auth, checkLicense, orderCtrl.markNotificationsAsRead);

module.exports = router;
