const router = require("express").Router();
const auth = require("../middleware/auth");
const orderCtrl = require("../controllers/orderController");

// 🔔 Hämtar notifikationer
router.get("/", auth, orderCtrl.getUserNotifications);

// 🔕 Markerar som lästa
router.put("/read", auth, orderCtrl.markNotificationsAsRead);

module.exports = router;
