const streamifier = require('streamifier');
const cloudinary = require('../config/cloudinary');

/**
 * Upload a buffer to Cloudinary
 * @param {Buffer} buffer - File buffer from multer memoryStorage
 * @param {string} folder - Cloudinary folder name
 * @returns {Promise<{url, publicId}>}
 */
const uploadToCloudinary = (buffer, folder = 'civic-complaints') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image', quality: 'auto', fetch_format: 'auto' },
      (error, result) => {
        if (error) return reject(error);
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

/**
 * Delete an image from Cloudinary by publicId
 */
const deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error('Cloudinary delete error:', err.message);
  }
};

module.exports = { uploadToCloudinary, deleteFromCloudinary };
