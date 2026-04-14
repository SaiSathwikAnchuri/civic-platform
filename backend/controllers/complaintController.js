const asyncHandler = require('express-async-handler');
const Complaint = require('../models/Complaint');
const { uploadToCloudinary } = require('../utils/cloudinaryHelper');
const { autoAssignPriority, detectDuplicate } = require('../utils/priorityEngine');
const { createNotification } = require('../utils/notificationHelper');
const { getIO } = require('../socket/socketManager');

// @desc    Submit a new complaint
// @route   POST /api/complaints
// @access  Private (citizen)
const submitComplaint = asyncHandler(async (req, res) => {
  const { title, description, category, address, city, pincode, lat, lng } = req.body;

  // Upload images to Cloudinary
  let images = [];
  if (req.files && req.files.length > 0) {
    const uploadPromises = req.files.map((f) => uploadToCloudinary(f.buffer, 'complaints'));
    images = await Promise.all(uploadPromises);
  }

  // Auto-assign priority
  const priority = autoAssignPriority(category, description);

  // Duplicate detection
  const duplicate = await detectDuplicate(Complaint, { category, address });
  let isDuplicate = false;
  let duplicateOf = undefined;
  if (duplicate) {
    isDuplicate = true;
    duplicateOf = duplicate._id;
    // Upvote the original complaint
    if (!duplicate.upvotes.includes(req.user._id)) {
      duplicate.upvotes.push(req.user._id);
      await duplicate.save();
    }
  }

  const complaint = await Complaint.create({
    title,
    description,
    category,
    priority,
    images,
    location: { address, city, pincode, coordinates: { lat: lat ? Number(lat) : undefined, lng: lng ? Number(lng) : undefined } },
    citizen: req.user._id,
    isDuplicate,
    duplicateOf,
    statusHistory: [{ status: 'Pending', changedBy: req.user._id, note: 'Complaint submitted' }],
  });

  // Notify citizen
  await createNotification({
    recipient: req.user._id,
    type: 'COMPLAINT_SUBMITTED',
    title: 'Complaint Submitted',
    message: `Your complaint "${title}" has been submitted successfully. Tracking ID: ${complaint._id}`,
    complaint: complaint._id,
  });

  // Broadcast new complaint to admins
  getIO().to('admin-room').emit('newComplaint', { complaintId: complaint._id, title, category, priority });

  res.status(201).json({
    success: true,
    message: isDuplicate ? 'Similar complaint exists. Your vote has been added.' : 'Complaint submitted successfully',
    data: complaint,
  });
});

// @desc    Get all complaints for logged-in citizen
// @route   GET /api/complaints/my
// @access  Private (citizen)
const getMyComplaints = asyncHandler(async (req, res) => {
  const { status, category, page = 1, limit = 10 } = req.query;
  const query = { citizen: req.user._id };
  if (status) query.status = status;
  if (category) query.category = category;

  const skip = (Number(page) - 1) * Number(limit);
  const [complaints, total] = await Promise.all([
    Complaint.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Complaint.countDocuments(query),
  ]);

  res.json({ success: true, data: complaints, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
});

// @desc    Get single complaint (citizen gets own, admin gets any)
// @route   GET /api/complaints/:id
// @access  Private
const getComplaintById = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id)
    .populate('citizen', 'name email phone')
    .populate('statusHistory.changedBy', 'name role');

  if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });

  // Citizens can only view their own
  if (req.user.role === 'citizen' && complaint.citizen._id.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }

  res.json({ success: true, data: complaint });
});

// @desc    Upvote a complaint
// @route   POST /api/complaints/:id/upvote
// @access  Private (citizen)
const upvoteComplaint = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });

  const alreadyUpvoted = complaint.upvotes.includes(req.user._id);
  if (alreadyUpvoted) {
    complaint.upvotes = complaint.upvotes.filter((id) => id.toString() !== req.user._id.toString());
  } else {
    complaint.upvotes.push(req.user._id);
  }
  await complaint.save();

  res.json({ success: true, message: alreadyUpvoted ? 'Upvote removed' : 'Upvoted', upvotes: complaint.upvotes.length });
});

module.exports = { submitComplaint, getMyComplaints, getComplaintById, upvoteComplaint };
