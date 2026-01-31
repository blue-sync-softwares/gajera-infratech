const Business = require('../models/Business');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * @desc    Create new business
 * @route   POST /api/v1/business
 * @access  Private/Admin
 */
const createBusiness = async (req, res, next) => {
  try {
    const business = await Business.create(req.body);
    console.log('Business created:', business);
    successResponse(res, 201, business, 'Business created successfully');
  } catch (error) {
    if (error.code === 11000) {
      return errorResponse(res, 400, 'Business with this slug already exists');
    }
    next(error);
  }
};

/**
 * @desc    Get all businesses
 * @route   GET /api/v1/business
 * @access  Public
 */
const getAllBusinesses = async (req, res, next) => {
  try {
    const { project_type, limit, page = 1 } = req.query;
    
    const query = {};
    
    // Filter by project type if provided
    if (project_type) {
      query.project_types = { $in: [project_type] };
    }
    
    const pageNum = parseInt(page);
    const limitNum = limit ? parseInt(limit) : 0;
    const skip = (pageNum - 1) * limitNum;
    
    let businessQuery = Business.find(query)
      .populate('business_testimonials')
      .populate('project_details');
    
    if (limitNum > 0) {
      businessQuery = businessQuery.limit(limitNum).skip(skip);
    }
    
    const businesses = await businessQuery;
    const total = await Business.countDocuments(query);
    
    const responseData = {
      businesses,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum || total,
        pages: limitNum > 0 ? Math.ceil(total / limitNum) : 1
      }
    };
    
    successResponse(res, 200, responseData, 'Businesses retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single business by slug
 * @route   GET /api/v1/business/:slug
 * @access  Public
 */
const getBusinessBySlug = async (req, res, next) => {
  try {
    const business = await Business.findOne({ slug: req.params.slug })
      .populate('business_testimonials')
      .populate('project_details');
    
    if (!business) {
      return errorResponse(res, 404, 'Business not found');
    }
    
    successResponse(res, 200, business, 'Business retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update business
 * @route   PUT /api/v1/business/:slug
 * @access  Private/Admin
 */
const updateBusiness = async (req, res, next) => {
  try {
    const business = await Business.findOne({ slug: req.params.slug });
    
    if (!business) {
      return errorResponse(res, 404, 'Business not found');
    }
    
    // Update fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        business[key] = req.body[key];
      }
    });
    
    await business.save();
    
    successResponse(res, 200, business, 'Business updated successfully');
  } catch (error) {
    if (error.code === 11000) {
      return errorResponse(res, 400, 'Business with this slug already exists');
    }
    next(error);
  }
};

/**
 * @desc    Delete business
 * @route   DELETE /api/v1/business/:slug
 * @access  Private/Admin
 */
const deleteBusiness = async (req, res, next) => {
  try {
    const business = await Business.findOne({ slug: req.params.slug });
    
    if (!business) {
      return errorResponse(res, 404, 'Business not found');
    }
    
    await business.deleteOne();
    
    successResponse(res, 200, null, 'Business deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBusiness,
  getAllBusinesses,
  getBusinessBySlug,
  updateBusiness,
  deleteBusiness
};
