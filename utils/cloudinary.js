const cloudinary = require('../config/cloudinary');
const fs = require('fs').promises;

/**
 * Upload file to Cloudinary
 * @param {String} filePath - Local file path
 * @param {String} folder - Folder name in Cloudinary (optional)
 * @param {Object} options - Additional Cloudinary upload options
 * @returns {Object} - Cloudinary upload result
 */
const uploadToCloudinary = async (filePath, folder = 'uploads', options = {}) => {
  try {
    const uploadOptions = {
      folder,
      resource_type: 'auto',
      ...options,
    };

    const result = await cloudinary.uploader.upload(filePath, uploadOptions);

    // Delete local file after successful upload
    try {
      await fs.unlink(filePath);
    } catch (unlinkError) {
      console.error('Error deleting local file:', unlinkError);
    }

    return {
      public_id: result.public_id,
      url: result.secure_url,
      resource_type: result.resource_type,
      format: result.format,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
    };
  } catch (error) {
    // Delete local file even if upload fails
    try {
      await fs.unlink(filePath);
    } catch (unlinkError) {
      console.error('Error deleting local file:', unlinkError);
    }
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
};

/**
 * Upload multiple files to Cloudinary
 * @param {Array} files - Array of file paths
 * @param {String} folder - Folder name in Cloudinary (optional)
 * @param {Object} options - Additional Cloudinary upload options
 * @returns {Array} - Array of Cloudinary upload results
 */
const uploadMultipleToCloudinary = async (files, folder = 'uploads', options = {}) => {
  try {
    const uploadPromises = files.map(file => uploadToCloudinary(file, folder, options));
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    throw new Error(`Multiple upload failed: ${error.message}`);
  }
};

/**
 * Delete file from Cloudinary
 * @param {String} publicId - Cloudinary public_id
 * @param {String} resourceType - Resource type (image, video, raw)
 * @returns {Object} - Deletion result
 */
const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });

    if (result.result !== 'ok' && result.result !== 'not found') {
      throw new Error('Failed to delete file from Cloudinary');
    }

    return {
      success: true,
      message: result.result === 'ok' ? 'File deleted successfully' : 'File not found',
      result: result.result,
    };
  } catch (error) {
    throw new Error(`Cloudinary deletion failed: ${error.message}`);
  }
};

/**
 * Delete multiple files from Cloudinary
 * @param {Array} publicIds - Array of Cloudinary public_ids
 * @param {String} resourceType - Resource type (image, video, raw)
 * @returns {Object} - Deletion result
 */
const deleteMultipleFromCloudinary = async (publicIds, resourceType = 'image') => {
  try {
    const result = await cloudinary.api.delete_resources(publicIds, {
      resource_type: resourceType,
    });

    return {
      success: true,
      deleted: result.deleted,
      deleted_counts: result.deleted_counts,
    };
  } catch (error) {
    throw new Error(`Multiple deletion failed: ${error.message}`);
  }
};

/**
 * Get file details from Cloudinary
 * @param {String} publicId - Cloudinary public_id
 * @param {String} resourceType - Resource type (image, video, raw)
 * @returns {Object} - File details
 */
const getFileDetails = async (publicId, resourceType = 'image') => {
  try {
    const result = await cloudinary.api.resource(publicId, {
      resource_type: resourceType,
    });

    return {
      public_id: result.public_id,
      url: result.secure_url,
      format: result.format,
      resource_type: result.resource_type,
      type: result.type,
      created_at: result.created_at,
      bytes: result.bytes,
      width: result.width,
      height: result.height,
      folder: result.folder,
    };
  } catch (error) {
    throw new Error(`Failed to get file details: ${error.message}`);
  }
};

/**
 * Get all files from a specific folder
 * @param {String} folder - Folder name in Cloudinary
 * @param {String} resourceType - Resource type (image, video, raw)
 * @param {Number} maxResults - Maximum number of results
 * @returns {Array} - Array of files
 */
const getFilesFromFolder = async (folder, resourceType = 'image', maxResults = 500) => {
  try {
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: folder,
      resource_type: resourceType,
      max_results: maxResults,
    });

    return result.resources.map(resource => ({
      public_id: resource.public_id,
      url: resource.secure_url,
      format: resource.format,
      created_at: resource.created_at,
      bytes: resource.bytes,
      width: resource.width,
      height: resource.height,
    }));
  } catch (error) {
    throw new Error(`Failed to get files from folder: ${error.message}`);
  }
};

/**
 * Delete entire folder from Cloudinary
 * @param {String} folder - Folder name in Cloudinary
 * @returns {Object} - Deletion result
 */
const deleteFolder = async (folder) => {
  try {
    const result = await cloudinary.api.delete_resources_by_prefix(folder);
    
    // Also delete the folder itself
    await cloudinary.api.delete_folder(folder);

    return {
      success: true,
      deleted: result.deleted,
      message: 'Folder deleted successfully',
    };
  } catch (error) {
    throw new Error(`Failed to delete folder: ${error.message}`);
  }
};

/**
 * Update/Transform image
 * @param {String} publicId - Cloudinary public_id
 * @param {Object} transformations - Transformation options
 * @returns {String} - Transformed image URL
 */
const getTransformedImageUrl = (publicId, transformations = {}) => {
  try {
    const url = cloudinary.url(publicId, {
      secure: true,
      ...transformations,
    });

    return url;
  } catch (error) {
    throw new Error(`Failed to generate transformed URL: ${error.message}`);
  }
};

module.exports = {
  uploadToCloudinary,
  uploadMultipleToCloudinary,
  deleteFromCloudinary,
  deleteMultipleFromCloudinary,
  getFileDetails,
  getFilesFromFolder,
  deleteFolder,
  getTransformedImageUrl,
};
