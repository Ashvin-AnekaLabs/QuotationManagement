const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
const {
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  changePasswordValidator,
  refreshTokenValidator,
} = require('../validations/authValidation');

router.post('/login', loginValidator, authController.login);
router.post('/refresh-token', refreshTokenValidator, authController.refreshToken);
router.post('/logout', refreshTokenValidator, authController.logout);
router.post('/forgot-password', forgotPasswordValidator, authController.forgotPassword);
router.post('/reset-password', resetPasswordValidator, authController.resetPassword);

// Authenticated Route
router.post('/change-password', authMiddleware, changePasswordValidator, authController.changePassword);

module.exports = router;
