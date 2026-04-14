const asyncHandler = require('express-async-handler');
const Complaint = require('../models/Complaint');
const User = require('../models/User');
const { uploadToCloudinary } = require('../utils/cloudinaryHelper');
const { createNotification } = require('../utils/notificationHelper');
const { getIO } = require('../socket/socketManager');

// @desc    Get all complaints (with filters, pagination)
// @route   GET /api/admin/complaints
// @access  Private (admin)
const getAllComplaints = asyncHandler(async (req, res) => {
  const { status, category, priority, department, search, page = 1, limit = 10, sort = '-createdAt' } = req.query;

  const query = {};
  if (status) query.status = status;
  if (category) query.category = category;
  if (priority) query.priority = priority;
  if (department) query['assignedTo.department'] = department;
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { 'location.address': { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [complaints, total] = await Promise.all([
    Complaint.find(query)
      .populate('citizen', 'name email phone')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit)),
    Complaint.countDocuments(query),
  ]);

  res.json({ success: true, data: complaints, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
});

// @desc    Update complaint status
// @route   PUT /api/admin/complaints/:id/status
// @access  Private (admin)
const updateComplaintStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  const validStatuses = ['Pending', 'In Progress', 'Resolved', 'Rejected'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status' });
  }

  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });

  complaint.status = status;
  if (status === 'Resolved') complaint.resolvedAt = new Date();
  complaint.statusHistory.push({ status, changedBy: req.user._id, note: note || '' });
  await complaint.save();

  // Notify citizen
  const typeMap = {
    'In Progress': 'STATUS_UPDATED',
    Resolved: 'COMPLAINT_RESOLVED',
    Rejected: 'COMPLAINT_REJECTED',
    Pending: 'STATUS_UPDATED',
  };
  await createNotification({
    recipient: complaint.citizen,
    type: typeMap[status],
    title: `Complaint ${status}`,
    message: `Your complaint "${complaint.title}" status has been updated to "${status}". ${note ? `Note: ${note}` : ''}`,
    complaint: complaint._id,
  });

  // Real-time update to admin room
  getIO().to('admin-room').emit('complaintUpdated', { id: complaint._id, status });

  res.json({ success: true, message: 'Status updated', data: complaint });
});

// @desc    Assign complaint to department
// @route   PUT /api/admin/complaints/:id/assign
// @access  Private (admin)
const assignComplaint = asyncHandler(async (req, res) => {
  const { department } = req.body;
  if (!department || department.trim() === '') {
    return res.status(400).json({ success: false, message: 'Department is required' });
  }

  const complaint = await Complaint.findByIdAndUpdate(
    req.params.id,
    {
      'assignedTo.department': department,
      'assignedTo.assignedAt': new Date(),
      status: 'In Progress',
    },
    { new: true }
  ).populate('citizen', 'name email');

  if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });

  await createNotification({
    recipient: complaint.citizen._id,
    type: 'COMPLAINT_ASSIGNED',
    title: 'Complaint Assigned',
    message: `Your complaint "${complaint.title}" has been assigned to the ${department} department.`,
    complaint: complaint._id,
  });

  res.json({ success: true, message: `Assigned to ${department}`, data: complaint });
});

// @desc    Upload resolution proof images
// @route   POST /api/admin/complaints/:id/proof
// @access  Private (admin)
const uploadResolutionProof = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ success: false, message: 'No files uploaded' });
  }

  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });

  const uploadPromises = req.files.map((f) => uploadToCloudinary(f.buffer, 'resolution-proofs'));
  const proofs = await Promise.all(uploadPromises);

  complaint.resolutionProof.push(...proofs.map((p) => ({ url: p.url, publicId: p.publicId })));
  if (req.body.note) complaint.resolutionNote = req.body.note;
  await complaint.save();

  res.json({ success: true, message: 'Resolution proof uploaded', data: complaint.resolutionProof });
});

// @desc    Admin analytics dashboard data
// @route   GET /api/admin/analytics
// @access  Private (admin)
const getAnalytics = asyncHandler(async (req, res) => {
  const [
    totalComplaints,
    pendingCount,
    inProgressCount,
    resolvedCount,
    rejectedCount,
    totalUsers,
    byCategory,
    byPriority,
    recentComplaints,
    resolutionTrend,
  ] = await Promise.all([
    Complaint.countDocuments(),
    Complaint.countDocuments({ status: 'Pending' }),
    Complaint.countDocuments({ status: 'In Progress' }),
    Complaint.countDocuments({ status: 'Resolved' }),
    Complaint.countDocuments({ status: 'Rejected' }),
    User.countDocuments({ role: 'citizen' }),
    Complaint.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
    Complaint.aggregate([{ $group: { _id: '$priority', count: { $sum: 1 } } }]),
    Complaint.find().sort({ createdAt: -1 }).limit(5).populate('citizen', 'name'),
    Complaint.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          total: { $sum: 1 },
          resolved: { $sum: { $cond: [{ $eq: ['$status', 'Resolved'] }, 1, 0] } },
        },
      },
      { $sort: { _id: -1 } },
      { $limit: 30 },
    ]),
  ]);

  res.json({
    success: true,
    data: {
      summary: { totalComplaints, pendingCount, inProgressCount, resolvedCount, rejectedCount, totalUsers },
      byCategory,
      byPriority,
      recentComplaints,
      resolutionTrend: resolutionTrend.reverse(),
    },
  });
});

// @desc    Get all users (admin)
// @route   GET /api/admin/users
// @access  Private (admin)
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ role: 'citizen' }).sort({ createdAt: -1 });
  res.json({ success: true, data: users, total: users.length });
});

// @desc    Toggle user active status
// @route   PUT /api/admin/users/:id/toggle
// @access  Private (admin)
const toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  user.isActive = !user.isActive;
  await user.save();
  res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'}`, data: user });
});

module.exports = {
  getAllComplaints,
  updateComplaintStatus,
  assignComplaint,
  uploadResolutionProof,
  getAnalytics,
  getAllUsers,
  toggleUserStatus,
};
