const router = require('express').Router();
const orderCtrl = require('../controllers/orderController');
const auth = require('../middleware/auth');
const checkPermission = require('../middleware/permissions');
const Order = require('../models/Order'); 

router.post('/', auth, orderCtrl.createOrder);
router.get('/', auth, orderCtrl.getOrders);
router.put('/:id', auth, checkPermission('edit_orders'), orderCtrl.updateOrderStatus);
router.delete('/:id', auth, checkPermission('edit_orders'), orderCtrl.deleteOrder);

router.put('/:id/details', auth, checkPermission('edit_orders'), orderCtrl.updateOrderDetails);
router.get('/:id/comments', auth, orderCtrl.getOrderComments);
router.post('/:id/comments', auth, checkPermission('edit_orders'), orderCtrl.addOrderComment);
router.put('/:id/assign', auth, checkPermission('edit_orders'), orderCtrl.assignManager);

//  Manager: hämtar beställningar som är tilldelade till inloggad användare
router.get('/my-tasks', auth, async (req, res) => {
  try {
    const tasks = await Order.find({ assignedTo: req.user.id });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ msg: 'Kunde inte hämta uppgifter' });
  }
});

module.exports = router;
