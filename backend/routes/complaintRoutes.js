const express = require('express');
const { body } = require('express-validator');
const {
  submitComplaint,
  getMyComplaints,
  getComplaintById,
  upvoteComplaint,
} = require('../controllers/complaintController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const validate = require('../middleware/validateMiddleware');

const router = express.Router();

router.use(protect);

router.post(
  '/',
  upload.array('images', 5),
  [
    body('title').trim().notEmpty().isLength({ min: 5, max: 100 }).withMessage('Title must be 5-100 characters'),
    body('description').trim().notEmpty().isLength({ min: 10, max: 1000 }).withMessage('Description must be 10-1000 characters'),
    body('category').notEmpty().withMessage('Category is required'),
    body('address').trim().notEmpty().withMessage('Address is required'),
  ],
  validate,
  submitComplaint
);

router.get('/my', getMyComplaints);
router.get('/:id', getComplaintById);
router.post('/:id/upvote', upvoteComplaint);

module.exports = router;
