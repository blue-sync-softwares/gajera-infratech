const { validationResult } = require('express-validator');
const WebsiteSettings = require('../models/WebsiteSettings');
const { successResponse, errorResponse } = require('../utils/response');
const { deleteFromCloudinary } = require('../utils/cloudinary');

/**
 * @desc    Create website settings (only once)
 * @route   POST /api/v1/website/settings
 * @access  Private/Admin
 */
exports.createSettings = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 400, 'Validation failed', errors.array());
    }

    // Check if settings already exist
    const existingSettings = await WebsiteSettings.findOne();
    if (existingSettings) {
      return errorResponse(res, 400, 'Website settings already exist. Please use update endpoint.');
    }

    // Create new settings
    const settings = await WebsiteSettings.create(req.body);

    return successResponse(res, 201, settings, 'Website settings created successfully');
  } catch (error) {
    console.error('Create settings error:', error);
    return errorResponse(res, 500, error.message || 'Failed to create website settings');
  }
};

/**
 * @desc    Get website settings
 * @route   GET /api/v1/website/settings
 * @access  Public
 */
exports.getSettings = async (req, res) => {
  try {
    const settings = await WebsiteSettings.findOne();

    if (!settings) {
      return errorResponse(res, 404, 'Website settings not found');
    }

    return successResponse(res, 200, settings, 'Website settings retrieved successfully');
  } catch (error) {
    console.error('Get settings error:', error);
    return errorResponse(res, 500, error.message || 'Failed to retrieve website settings');
  }
};

/**
 * @desc    Update website settings
 * @route   PUT /api/v1/website/settings
 * @access  Private/Admin
 */
exports.updateSettings = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 400, 'Validation failed', errors.array());
    }

    const settings = await WebsiteSettings.findOne();

    if (!settings) {
      return errorResponse(res, 404, 'Website settings not found. Please create settings first.');
    }

    // Handle logo update - delete old logo from cloudinary if new one is provided
    if (req.body.logo && req.body.logo.public_id !== settings.logo.public_id) {
      try {
        await deleteFromCloudinary(settings.logo.public_id, 'image');
      } catch (error) {
        console.error('Error deleting old logo:', error);
      }
    }

    // Handle favicon update - delete old favicon from cloudinary if new one is provided
    if (req.body.favicon && settings.favicon?.public_id && req.body.favicon.public_id !== settings.favicon.public_id) {
      try {
        await deleteFromCloudinary(settings.favicon.public_id, 'image');
      } catch (error) {
        console.error('Error deleting old favicon:', error);
      }
    }

    // Update settings
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'object' && !Array.isArray(req.body[key])) {
        // Handle nested objects
        settings[key] = { ...settings[key], ...req.body[key] };
      } else {
        settings[key] = req.body[key];
      }
    });

    await settings.save();

    return successResponse(res, 200, settings, 'Website settings updated successfully');
  } catch (error) {
    console.error('Update settings error:', error);
    return errorResponse(res, 500, error.message || 'Failed to update website settings');
  }
};

/**
 * @desc    Delete website settings
 * @route   DELETE /api/v1/website/settings
 * @access  Private/Admin
 */
exports.deleteSettings = async (req, res) => {
  try {
    const settings = await WebsiteSettings.findOne();

    if (!settings) {
      return errorResponse(res, 404, 'Website settings not found');
    }

    // Delete logo from cloudinary
    if (settings.logo?.public_id) {
      try {
        await deleteFromCloudinary(settings.logo.public_id, 'image');
      } catch (error) {
        console.error('Error deleting logo:', error);
      }
    }

    // Delete favicon from cloudinary
    if (settings.favicon?.public_id) {
      try {
        await deleteFromCloudinary(settings.favicon.public_id, 'image');
      } catch (error) {
        console.error('Error deleting favicon:', error);
      }
    }

    await WebsiteSettings.deleteOne({ _id: settings._id });

    return successResponse(res, 200, null, 'Website settings deleted successfully');
  } catch (error) {
    console.error('Delete settings error:', error);
    return errorResponse(res, 500, error.message || 'Failed to delete website settings');
  }
};
