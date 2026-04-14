const mongoose = require('mongoose');

const CATEGORIES = [
  'Pothole',
  'Garbage Overflow',
  'Drainage Blockage',
  'Street Light',
  'Water Supply',
  'Road Damage',
  'Illegal Dumping',
  'Noise Pollution',
  'Encroachment',
  'Other',
];

const complaintSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters'],
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: CATEGORIES,
    },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Resolved', 'Rejected'],
      default: 'Pending',
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
    },
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String },
      },
    ],
    resolutionProof: [
      {
        url: { type: String },
        publicId: { type: String },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    location: {
      address: {
        type: String,
        required: [true, 'Address is required'],
        trim: true,
      },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number },
      },
      city: { type: String, trim: true },
      pincode: { type: String, trim: true },
    },
    citizen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedTo: {
      department: { type: String, trim: true },
      assignedAt: { type: Date },
    },
    adminNotes: {
      type: String,
      maxlength: [500, 'Admin notes cannot exceed 500 characters'],
    },
    resolutionNote: {
      type: String,
      maxlength: [500, 'Resolution note cannot exceed 500 characters'],
    },
    resolvedAt: { type: Date },
    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isDuplicate: { type: Boolean, default: false },
    duplicateOf: { type: mongoose.Schema.Types.ObjectId, ref: 'Complaint' },
    statusHistory: [
      {
        status: { type: String },
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        note: { type: String },
        changedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// Index for geo-search and text search
complaintSchema.index({ 'location.coordinates': '2dsphere' });
complaintSchema.index({ category: 1, status: 1, priority: 1, createdAt: -1 });

module.exports = mongoose.model('Complaint', complaintSchema);
module.exports.CATEGORIES = CATEGORIES;
