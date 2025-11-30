const Gallery = require('../models/Gallery');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * @desc    Create new gallery image
 * @route   POST /api/v1/gallery
 * @access  Private/Admin
 */
const createGalleryImage = async (req, res, next) => {
  try {
    const galleryImage = await Gallery.create(req.body);
    
    successResponse(res, 201, galleryImage, 'Gallery image created successfully');
  } catch (error) {
    if (error.code === 11000) {
      return errorResponse(res, 400, 'Gallery image with this ID already exists');
    }
    next(error);
  }
};

/**
 * @desc    Get all gallery images
 * @route   GET /api/v1/gallery
 * @access  Public
 */
const getAllGalleryImages = async (req, res, next) => {
  try {
    const { tag, category, isActive, limit, page = 1 } = req.query;
    
    const query = {};
    
    // Filter by tag if provided
    if (tag) {
      query.tag = tag.toLowerCase();
    }
    
    // Filter by category if provided
    if (category) {
      query.category = category;
    }
    
    // Filter by active status if provided
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    
    const pageNum = parseInt(page);
    const limitNum = limit ? parseInt(limit) : 0;
    const skip = (pageNum - 1) * limitNum;
    
    let galleryQuery = Gallery.find(query);
    
    if (limitNum > 0) {
      galleryQuery = galleryQuery.limit(limitNum).skip(skip);
    }
    
    // Sort by createdAt descending
    galleryQuery = galleryQuery.sort({ createdAt: -1 });
    
    const images = await galleryQuery;
    const total = await Gallery.countDocuments(query);
    
    const responseData = {
      images,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum || total,
        pages: limitNum > 0 ? Math.ceil(total / limitNum) : 1
      }
    };
    
    successResponse(res, 200, responseData, 'Gallery images retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single gallery image by ID
 * @route   GET /api/v1/gallery/:id
 * @access  Public
 */
const getGalleryImageById = async (req, res, next) => {
  try {
    const galleryImage = await Gallery.findById(req.params.id);
    
    if (!galleryImage) {
      return errorResponse(res, 404, 'Gallery image not found');
    }
    
    successResponse(res, 200, galleryImage, 'Gallery image retrieved successfully');
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return errorResponse(res, 400, 'Invalid gallery image ID');
    }
    next(error);
  }
};

/**
 * @desc    Update gallery image
 * @route   PUT /api/v1/gallery/:id
 * @access  Private/Admin
 */
const updateGalleryImage = async (req, res, next) => {
  try {
    const galleryImage = await Gallery.findById(req.params.id);
    
    if (!galleryImage) {
      return errorResponse(res, 404, 'Gallery image not found');
    }
    
    // Update fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined && key !== 'gallery_id') { // Don't allow updating gallery_id
        galleryImage[key] = req.body[key];
      }
    });
    
    await galleryImage.save();
    
    successResponse(res, 200, galleryImage, 'Gallery image updated successfully');
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return errorResponse(res, 400, 'Invalid gallery image ID');
    }
    next(error);
  }
};

/**
 * @desc    Delete gallery image
 * @route   DELETE /api/v1/gallery/:id
 * @access  Private/Admin
 */
const deleteGalleryImage = async (req, res, next) => {
  try {
    const galleryImage = await Gallery.findById(req.params.id);
    
    if (!galleryImage) {
      return errorResponse(res, 404, 'Gallery image not found');
    }
    
    await galleryImage.deleteOne();
    
    successResponse(res, 200, null, 'Gallery image deleted successfully');
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return errorResponse(res, 400, 'Invalid gallery image ID');
    }
    next(error);
  }
};

module.exports = {
  createGalleryImage,
  getAllGalleryImages,
  getGalleryImageById,
  updateGalleryImage,
  deleteGalleryImage
};
