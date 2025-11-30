const { validationResult } = require('express-validator');
const HomeSettings = require('../models/HomeSettings');
const { successResponse, errorResponse } = require('../utils/response');
const { deleteFromCloudinary } = require('../utils/cloudinary');

/**
 * @desc    Create home settings (only once)
 * @route   POST /api/v1/website/home-settings
 * @access  Private/Admin
 */
exports.createHomeSettings = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 400, 'Validation failed', errors.array());
    }

    // Check if settings already exist
    const existingSettings = await HomeSettings.findOne();
    if (existingSettings) {
      return errorResponse(res, 400, 'Home settings already exist. Please use update endpoint.');
    }

    // Create new settings
    const settings = await HomeSettings.create(req.body);

    // Populate references if needed
    await settings.populate('featuredProjects topTestimonial');

    return successResponse(res, 201, settings, 'Home settings created successfully');
  } catch (error) {
    console.error('Create home settings error:', error);
    return errorResponse(res, 500, error.message || 'Failed to create home settings');
  }
};

/**
 * @desc    Get home settings
 * @route   GET /api/v1/website/home-settings
 * @access  Public
 */
exports.getHomeSettings = async (req, res) => {
  try {
    const settings = await HomeSettings.findOne()
      .populate('featuredProjects')
      .populate('topTestimonial');

    if (!settings) {
      return errorResponse(res, 404, 'Home settings not found');
    }

    return successResponse(res, 200, settings, 'Home settings retrieved successfully');
  } catch (error) {
    console.error('Get home settings error:', error);
    return errorResponse(res, 500, error.message || 'Failed to retrieve home settings');
  }
};

/**
 * @desc    Update home settings
 * @route   PUT /api/v1/website/home-settings
 * @access  Private/Admin
 */
exports.updateHomeSettings = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 400, 'Validation failed', errors.array());
    }

    const settings = await HomeSettings.findOne();

    if (!settings) {
      return errorResponse(res, 404, 'Home settings not found. Please create settings first.');
    }

    // Handle features array update - delete old images from cloudinary if new ones are provided
    if (req.body.features && Array.isArray(req.body.features)) {
      const oldFeatures = settings.features || [];
      
      // Find features that are being replaced or removed
      for (const oldFeature of oldFeatures) {
        const stillExists = req.body.features.find(f => f.key === oldFeature.key);
        
        if (!stillExists) {
          // Feature removed - delete its image
          try {
            await deleteFromCloudinary(oldFeature.image.public_id, 'image');
          } catch (error) {
            console.error('Error deleting old feature image:', error);
          }
        } else if (stillExists.image && stillExists.image.public_id !== oldFeature.image.public_id) {
          // Feature image updated - delete old image
          try {
            await deleteFromCloudinary(oldFeature.image.public_id, 'image');
          } catch (error) {
            console.error('Error deleting old feature image:', error);
          }
        }
      }
    }

    // Update settings
    Object.keys(req.body).forEach(key => {
      settings[key] = req.body[key];
    });

    await settings.save();

    // Populate references
    await settings.populate('featuredProjects topTestimonial');

    return successResponse(res, 200, settings, 'Home settings updated successfully');
  } catch (error) {
    console.error('Update home settings error:', error);
    return errorResponse(res, 500, error.message || 'Failed to update home settings');
  }
};

/**
 * @desc    Delete home settings
 * @route   DELETE /api/v1/website/home-settings
 * @access  Private/Admin
 */
exports.deleteHomeSettings = async (req, res) => {
  try {
    const settings = await HomeSettings.findOne();

    if (!settings) {
      return errorResponse(res, 404, 'Home settings not found');
    }

    // Delete all feature images from cloudinary
    if (settings.features && settings.features.length > 0) {
      for (const feature of settings.features) {
        if (feature.image?.public_id) {
          try {
            await deleteFromCloudinary(feature.image.public_id, 'image');
          } catch (error) {
            console.error('Error deleting feature image:', error);
          }
        }
      }
    }

    await HomeSettings.deleteOne({ _id: settings._id });

    return successResponse(res, 200, null, 'Home settings deleted successfully');
  } catch (error) {
    console.error('Delete home settings error:', error);
    return errorResponse(res, 500, error.message || 'Failed to delete home settings');
  }
};
