const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const userController = require('../controllers/userController');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' },
});

router.post('/register', authLimiter, userController.register);
router.post('/login', authLimiter, userController.login);
router.post('/google-login', authLimiter, userController.googleLogin);
router.post('/google-register', authLimiter, userController.googleRegister);
router.post('/:user_id/upgrade', userController.upgrade);

module.exports = router;
