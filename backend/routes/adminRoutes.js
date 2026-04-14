const express = require('express');
const {
  getAllComplaints,
  updateComplaintStatus,
  assignComplaint,
  uploadResolutionProof,
  getAnalytics,
  getAllUsers,
  toggleUserStatus,
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.use(protect, adminOnly);

// Complaint management
router.get('/complaints', getAllComplaints);
router.put('/complaints/:id/status', updateComplaintStatus);
router.put('/complaints/:id/assign', assignComplaint);
router.post('/complaints/:id/proof', upload.array('proofs', 3), uploadResolutionProof);

// Analytics
router.get('/analytics', getAnalytics);

// User management
router.get('/users', getAllUsers);
router.put('/users/:id/toggle', toggleUserStatus);

module.exports = router;
