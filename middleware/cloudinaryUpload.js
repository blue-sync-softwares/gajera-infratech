const { uploadSingleImage, uploadMultipleImages } = require('../middleware/upload');
const { uploadToCloudinary, uploadMultipleToCloudinary } = require('../utils/cloudinary');

/**
 * Middleware to handle single file upload to Cloudinary
 * Usage: router.post('/upload', uploadSingleToCloudinary('image', 'folder-name'), controller)
 */
const uploadSingleToCloudinary = (fieldName, folder = 'uploads') => {
  return async (req, res, next) => {
    // First use multer to handle the upload
    uploadSingleImage(fieldName)(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }

      // If no file uploaded, move to next middleware
      if (!req.file) {
        return next();
      }

      try {
        // Upload to Cloudinary
        const result = await uploadToCloudinary(req.file.path, folder);
        
        // Attach cloudinary result to request object
        req.cloudinaryResult = result;
        
        next();
      } catch (error) {
        return res.status(500).json({
          success: false,
          message: error.message,
        });
      }
    });
  };
};

/**
 * Middleware to handle multiple files upload to Cloudinary
 * Usage: router.post('/upload-multiple', uploadMultipleToCloudinary('images', 'folder-name', 5), controller)
 */
const uploadMultipleFilesToCloudinary = (fieldName, folder = 'uploads', maxCount = 10) => {
  return async (req, res, next) => {
    // First use multer to handle the uploads
    uploadMultipleImages(fieldName, maxCount)(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }

      // If no files uploaded, move to next middleware
      if (!req.files || req.files.length === 0) {
        return next();
      }

      try {
        // Get all file paths
        const filePaths = req.files.map(file => file.path);
        
        // Upload all files to Cloudinary
        const results = await uploadMultipleToCloudinary(filePaths, folder);
        
        // Attach cloudinary results to request object
        req.cloudinaryResults = results;
        
        next();
      } catch (error) {
        return res.status(500).json({
          success: false,
          message: error.message,
        });
      }
    });
  };
};

module.exports = {
  uploadSingleToCloudinary,
  uploadMultipleFilesToCloudinary,
};
