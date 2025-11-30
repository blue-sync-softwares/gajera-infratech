const { deleteFromCloudinary, getFileDetails, getFilesFromFolder } = require('../utils/cloudinary');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * @desc    Upload single file to Cloudinary
 * @route   POST /api/v1/upload/single
 * @access  Public (add authentication middleware as needed)
 */
exports.uploadSingle = async (req, res) => {
  try {
    if (!req.cloudinaryResult) {
      return errorResponse(res, 400, 'No file uploaded');
    }

    return successResponse(res, 200, req.cloudinaryResult, 'File uploaded successfully');
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

/**
 * @desc    Upload multiple files to Cloudinary
 * @route   POST /api/v1/upload/multiple
 * @access  Public (add authentication middleware as needed)
 */
exports.uploadMultiple = async (req, res) => {
  try {
    if (!req.cloudinaryResults || req.cloudinaryResults.length === 0) {
      return errorResponse(res, 400, 'No files uploaded');
    }

    return successResponse(
      res, 
      200, 
      { files: req.cloudinaryResults, count: req.cloudinaryResults.length }, 
      `${req.cloudinaryResults.length} file(s) uploaded successfully`
    );
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

/**
 * @desc    Delete file from Cloudinary
 * @route   DELETE /api/v1/upload/:publicId
 * @access  Public (add authentication middleware as needed)
 */
exports.deleteFile = async (req, res) => {
  try {
    const { publicId } = req.params;
    const { resourceType } = req.query; // optional: image, video, raw

    // Replace URL-encoded slash with actual slash
    const decodedPublicId = publicId.replace(/%2F/g, '/');

    const result = await deleteFromCloudinary(decodedPublicId, resourceType);

    return successResponse(res, 200, result, result.message);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

/**
 * @desc    Get file details from Cloudinary
 * @route   GET /api/v1/upload/file/:publicId
 * @access  Public (add authentication middleware as needed)
 */
exports.getFile = async (req, res) => {
  try {
    const { publicId } = req.params;
    const { resourceType } = req.query; // optional: image, video, raw

    // Replace URL-encoded slash with actual slash
    const decodedPublicId = publicId.replace(/%2F/g, '/');

    const result = await getFileDetails(decodedPublicId, resourceType);

    return successResponse(res, 200, result, 'File details retrieved successfully');
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

/**
 * @desc    Get all files from a folder in Cloudinary
 * @route   GET /api/v1/upload/folder/:folderName
 * @access  Public (add authentication middleware as needed)
 */
exports.getFolderFiles = async (req, res) => {
  try {
    const { folderName } = req.params;
    const { resourceType, maxResults } = req.query;

    const result = await getFilesFromFolder(
      folderName, 
      resourceType || 'image', 
      maxResults ? parseInt(maxResults) : 500
    );

    return successResponse(
      res, 
      200, 
      { files: result, count: result.length }, 
      'Folder files retrieved successfully'
    );
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};
