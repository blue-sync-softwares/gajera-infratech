const { validationResult } = require('express-validator');
const ContactUsSettings = require('../models/ContactUsSettings');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * @desc    Create contact us settings (only once)
 * @route   POST /api/v1/website/contact-us-settings
 * @access  Private/Admin
 */
exports.createContactUsSettings = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 400, 'Validation failed', errors.array());
    }

    // Check if settings already exist
    const existingSettings = await ContactUsSettings.findOne();
    if (existingSettings) {
      return errorResponse(res, 400, 'Contact Us settings already exist. Please use update endpoint.');
    }

    // Create new settings
    const settings = await ContactUsSettings.create(req.body);

    return successResponse(res, 201, settings, 'Contact Us settings created successfully');
  } catch (error) {
    console.error('Create contact us settings error:', error);
    return errorResponse(res, 500, error.message || 'Failed to create contact us settings');
  }
};

/**
 * @desc    Get contact us settings
 * @route   GET /api/v1/website/contact-us-settings
 * @access  Public
 */
exports.getContactUsSettings = async (req, res) => {
  try {
    const settings = await ContactUsSettings.findOne();

    if (!settings) {
      return errorResponse(res, 404, 'Contact Us settings not found');
    }

    return successResponse(res, 200, settings, 'Contact Us settings retrieved successfully');
  } catch (error) {
    console.error('Get contact us settings error:', error);
    return errorResponse(res, 500, error.message || 'Failed to retrieve contact us settings');
  }
};

/**
 * @desc    Get enabled form fields configuration
 * @route   GET /api/v1/website/contact-us-settings/form-config
 * @access  Public
 */
exports.getFormConfig = async (req, res) => {
  try {
    const settings = await ContactUsSettings.findOne();

    if (!settings) {
      return errorResponse(res, 404, 'Contact Us settings not found');
    }

    const enabledFields = settings.getEnabledFormFields();
    const mandatoryFields = settings.getMandatoryFormFields();

    return successResponse(
      res,
      200,
      { fields: enabledFields, mandatoryFields },
      'Form configuration retrieved successfully'
    );
  } catch (error) {
    console.error('Get form config error:', error);
    return errorResponse(res, 500, error.message || 'Failed to retrieve form configuration');
  }
};

/**
 * @desc    Update contact us settings
 * @route   PUT /api/v1/website/contact-us-settings
 * @access  Private/Admin
 */
exports.updateContactUsSettings = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 400, 'Validation failed', errors.array());
    }

    const settings = await ContactUsSettings.findOne();

    if (!settings) {
      return errorResponse(res, 404, 'Contact Us settings not found. Please create settings first.');
    }

    // Update settings
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'object' && !Array.isArray(req.body[key])) {
        // Handle nested objects (like contactUsFormFields)
        if (key === 'contactUsFormFields') {
          // Deep merge for form fields
          Object.keys(req.body[key]).forEach(fieldKey => {
            if (settings[key][fieldKey]) {
              settings[key][fieldKey] = { ...settings[key][fieldKey], ...req.body[key][fieldKey] };
            }
          });
        } else {
          settings[key] = { ...settings[key], ...req.body[key] };
        }
      } else {
        settings[key] = req.body[key];
      }
    });

    await settings.save();

    return successResponse(res, 200, settings, 'Contact Us settings updated successfully');
  } catch (error) {
    console.error('Update contact us settings error:', error);
    return errorResponse(res, 500, error.message || 'Failed to update contact us settings');
  }
};

/**
 * @desc    Delete contact us settings
 * @route   DELETE /api/v1/website/contact-us-settings
 * @access  Private/Admin
 */
exports.deleteContactUsSettings = async (req, res) => {
  try {
    const settings = await ContactUsSettings.findOne();

    if (!settings) {
      return errorResponse(res, 404, 'Contact Us settings not found');
    }

    await ContactUsSettings.deleteOne({ _id: settings._id });

    return successResponse(res, 200, null, 'Contact Us settings deleted successfully');
  } catch (error) {
    console.error('Delete contact us settings error:', error);
    return errorResponse(res, 500, error.message || 'Failed to delete contact us settings');
  }
};
