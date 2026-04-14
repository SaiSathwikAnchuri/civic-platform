const express = require('express');
const { body } = require('express-validator');
const { registerUser, loginUser, getMe, updateMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');

const router = express.Router();

router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2, max: 50 }),
    body('email').isEmail().withMessage('Enter a valid email').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('phone').optional().matches(/^[0-9]{10}$/).withMessage('Enter a valid 10-digit phone number'),
  ],
  validate,
  registerUser
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Enter a valid email').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  loginUser
);

router.get('/me', protect, getMe);
router.put(
  '/me',
  protect,
  [
    body('name').optional().trim().isLength({ min: 2, max: 50 }),
    body('phone').optional().matches(/^[0-9]{10}$/).withMessage('Enter a valid 10-digit phone number'),
  ],
  validate,
  updateMe
);

module.exports = router;
