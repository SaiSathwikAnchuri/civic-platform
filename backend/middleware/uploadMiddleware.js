const multer = require('multer');

// Store in memory buffer for Cloudinary streaming
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 5 }, // 5MB per file, max 5 files
});

module.exports = upload;
