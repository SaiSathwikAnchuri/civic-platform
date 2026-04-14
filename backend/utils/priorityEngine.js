/**
 * Auto-assign priority based on complaint category and description keywords
 */
const PRIORITY_MAP = {
  'Pothole': 'High',
  'Drainage Blockage': 'Critical',
  'Garbage Overflow': 'High',
  'Street Light': 'Medium',
  'Water Supply': 'Critical',
  'Road Damage': 'High',
  'Illegal Dumping': 'Medium',
  'Noise Pollution': 'Low',
  'Encroachment': 'Medium',
  'Other': 'Low',
};

const CRITICAL_KEYWORDS = ['urgent', 'danger', 'accident', 'flood', 'overflow', 'broken', 'emergency'];

const autoAssignPriority = (category, description = '') => {
  const desc = description.toLowerCase();
  const hasCriticalKeyword = CRITICAL_KEYWORDS.some((kw) => desc.includes(kw));
  if (hasCriticalKeyword) return 'Critical';
  return PRIORITY_MAP[category] || 'Medium';
};

/**
 * Check for duplicate complaints:
 * - Same category + same address within last 7 days
 */
const detectDuplicate = async (Complaint, { category, address }) => {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const existing = await Complaint.findOne({
    category,
    'location.address': { $regex: new RegExp(address.substring(0, 20), 'i') },
    status: { $ne: 'Resolved' },
    createdAt: { $gte: sevenDaysAgo },
  });
  return existing || null;
};

module.exports = { autoAssignPriority, detectDuplicate };
