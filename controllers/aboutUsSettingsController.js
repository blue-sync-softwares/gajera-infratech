const AboutUsSettings = require('../models/AboutUsSettings');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * @desc    Create About Us settings (Admin only, Singleton)
 * @route   POST /api/v1/website/about-us-settings
 * @access  Private/Admin
 */
const createAboutUsSettings = async (req, res, next) => {
  try {
    // Check if settings already exist (singleton)
    const existingSettings = await AboutUsSettings.findOne();
    if (existingSettings) {
      return errorResponse(res, 400, 'About Us settings already exist. Use update endpoint instead.');
    }

    const settings = await AboutUsSettings.create(req.body);
    
    successResponse(res, 201, settings, 'About Us settings created successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get About Us settings
 * @route   GET /api/v1/website/about-us-settings
 * @access  Public
 */
const getAboutUsSettings = async (req, res, next) => {
  try {
    const settings = await AboutUsSettings.findOne().populate('featuredTestimonial');
    
    if (!settings) {
      return errorResponse(res, 404, 'About Us settings not found');
    }

    successResponse(res, 200, settings, 'About Us settings retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update About Us settings
 * @route   PUT /api/v1/website/about-us-settings
 * @access  Private/Admin
 */
const updateAboutUsSettings = async (req, res, next) => {
  try {
    let settings = await AboutUsSettings.findOne();
    
    if (!settings) {
      return errorResponse(res, 404, 'About Us settings not found. Please create settings first.');
    }

    // Deep merge for nested objects and arrays
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        settings[key] = req.body[key];
      }
    });

    await settings.save();
    
    successResponse(res, 200, settings, 'About Us settings updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete About Us settings
 * @route   DELETE /api/v1/website/about-us-settings
 * @access  Private/Admin
 */
const deleteAboutUsSettings = async (req, res, next) => {
  try {
    const settings = await AboutUsSettings.findOne();
    
    if (!settings) {
      return errorResponse(res, 404, 'About Us settings not found');
    }

    await settings.deleteOne();
    
    successResponse(res, 200, null, 'About Us settings deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAboutUsSettings,
  getAboutUsSettings,
  updateAboutUsSettings,
  deleteAboutUsSettings
};
