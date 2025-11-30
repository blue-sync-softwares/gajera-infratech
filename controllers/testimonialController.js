const Testimonial = require('../models/Testimonial');
const Project = require('../models/Project');
const Business = require('../models/Business');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * @desc    Create new testimonial
 * @route   POST /api/v1/testimonial
 * @access  Private/Admin
 */
const createTestimonial = async (req, res, next) => {
  try {
    // Validate if project exists (if provided)
    if (req.body.project_slug) {
      const projectExists = await Project.findOne({ slug: req.body.project_slug });
      if (!projectExists) {
        return errorResponse(res, 404, 'Project not found with the provided slug');
      }
    }

    // Validate if business exists (if provided)
    if (req.body.business_slug) {
      const businessExists = await Business.findOne({ slug: req.body.business_slug });
      if (!businessExists) {
        return errorResponse(res, 404, 'Business not found with the provided slug');
      }
    }

    const testimonial = await Testimonial.create(req.body);
    
    successResponse(res, 201, testimonial, 'Testimonial created successfully');
  } catch (error) {
    if (error.code === 11000) {
      return errorResponse(res, 400, 'Testimonial with this ID already exists');
    }
    next(error);
  }
};

/**
 * @desc    Get all testimonials
 * @route   GET /api/v1/testimonial
 * @access  Public
 */
const getAllTestimonials = async (req, res, next) => {
  try {
    const { project_slug, business_slug, limit, page = 1 } = req.query;
    
    const query = {};
    
    // Filter by project slug if provided
    if (project_slug) {
      query.project_slug = project_slug;
    }
    
    // Filter by business slug if provided
    if (business_slug) {
      query.business_slug = business_slug;
    }
    
    const pageNum = parseInt(page);
    const limitNum = limit ? parseInt(limit) : 0;
    const skip = (pageNum - 1) * limitNum;
    
    let testimonialQuery = Testimonial.find(query);
    
    if (limitNum > 0) {
      testimonialQuery = testimonialQuery.limit(limitNum).skip(skip);
    }
    
    // Sort by createdAt descending
    testimonialQuery = testimonialQuery.sort({ createdAt: -1 });
    
    const testimonials = await testimonialQuery;
    const total = await Testimonial.countDocuments(query);
    
    const responseData = {
      testimonials,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum || total,
        pages: limitNum > 0 ? Math.ceil(total / limitNum) : 1
      }
    };
    
    successResponse(res, 200, responseData, 'Testimonials retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single testimonial by ID
 * @route   GET /api/v1/testimonial/:id
 * @access  Public
 */
const getTestimonialById = async (req, res, next) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    
    if (!testimonial) {
      return errorResponse(res, 404, 'Testimonial not found');
    }
    
    // Optionally populate project and business details
    let responseData = testimonial.toObject();
    
    if (testimonial.project_slug) {
      const project = await Project.findOne({ slug: testimonial.project_slug });
      responseData.project = project || null;
    }
    
    if (testimonial.business_slug) {
      const business = await Business.findOne({ slug: testimonial.business_slug });
      responseData.business = business || null;
    }
    
    successResponse(res, 200, responseData, 'Testimonial retrieved successfully');
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return errorResponse(res, 400, 'Invalid testimonial ID');
    }
    next(error);
  }
};

/**
 * @desc    Update testimonial
 * @route   PUT /api/v1/testimonial/:id
 * @access  Private/Admin
 */
const updateTestimonial = async (req, res, next) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    
    if (!testimonial) {
      return errorResponse(res, 404, 'Testimonial not found');
    }
    
    // Validate if project exists when updating project_slug
    if (req.body.project_slug && req.body.project_slug !== testimonial.project_slug) {
      const projectExists = await Project.findOne({ slug: req.body.project_slug });
      if (!projectExists) {
        return errorResponse(res, 404, 'Project not found with the provided slug');
      }
    }
    
    // Validate if business exists when updating business_slug
    if (req.body.business_slug && req.body.business_slug !== testimonial.business_slug) {
      const businessExists = await Business.findOne({ slug: req.body.business_slug });
      if (!businessExists) {
        return errorResponse(res, 404, 'Business not found with the provided slug');
      }
    }
    
    // Update fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined && key !== 'testimonial_id') { // Don't allow updating testimonial_id
        testimonial[key] = req.body[key];
      }
    });
    
    await testimonial.save();
    
    successResponse(res, 200, testimonial, 'Testimonial updated successfully');
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return errorResponse(res, 400, 'Invalid testimonial ID');
    }
    next(error);
  }
};

/**
 * @desc    Delete testimonial
 * @route   DELETE /api/v1/testimonial/:id
 * @access  Private/Admin
 */
const deleteTestimonial = async (req, res, next) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    
    if (!testimonial) {
      return errorResponse(res, 404, 'Testimonial not found');
    }
    
    await testimonial.deleteOne();
    
    successResponse(res, 200, null, 'Testimonial deleted successfully');
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return errorResponse(res, 400, 'Invalid testimonial ID');
    }
    next(error);
  }
};

module.exports = {
  createTestimonial,
  getAllTestimonials,
  getTestimonialById,
  updateTestimonial,
  deleteTestimonial
};
