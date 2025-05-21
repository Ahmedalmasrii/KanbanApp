const router = require('express').Router();
const authCtrl = require('../controllers/authController');

router.post('/register', authCtrl.register);
router.post('/login', authCtrl.login);
router.post('/change-password', authCtrl.changePassword);

module.exports = router;
