const Project = require('../models/Project');
const Business = require('../models/Business');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * @desc    Create new project
 * @route   POST /api/v1/project
 * @access  Private/Admin
 */
const createProject = async (req, res, next) => {
  try {
    // Validate if business exists
    if (req.body.business_name_slug) {
      const businessExists = await Business.findOne({ slug: req.body.business_name_slug });
      if (!businessExists) {
        return errorResponse(res, 404, 'Business not found with the provided slug');
      }
    }

    const project = await Project.create(req.body);
    
    successResponse(res, 201, project, 'Project created successfully');
  } catch (error) {
    if (error.code === 11000) {
      return errorResponse(res, 400, 'Project with this slug or project_id already exists');
    }
    next(error);
  }
};

/**
 * @desc    Get all projects
 * @route   GET /api/v1/project
 * @access  Public
 */
const getAllProjects = async (req, res, next) => {
  try {
    const { business_slug, project_type, limit, page = 1 } = req.query;
    
    const query = {};
    
    // Filter by business slug if provided
    if (business_slug) {
      query.business_name_slug = business_slug;
    }
    
    // Filter by project type if provided
    if (project_type) {
      query.project_type = project_type;
    }
    
    const pageNum = parseInt(page);
    const limitNum = limit ? parseInt(limit) : 0;
    const skip = (pageNum - 1) * limitNum;
    
    let projectQuery = Project.find(query);
    
    if (limitNum > 0) {
      projectQuery = projectQuery.limit(limitNum).skip(skip);
    }
    
    // Sort by createdAt descending
    projectQuery = projectQuery.sort({ createdAt: -1 });
    
    const projects = await projectQuery;
    const total = await Project.countDocuments(query);
    
    const responseData = {
      projects,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum || total,
        pages: limitNum > 0 ? Math.ceil(total / limitNum) : 1
      }
    };
    
    successResponse(res, 200, responseData, 'Projects retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single project by slug
 * @route   GET /api/v1/project/:slug
 * @access  Public
 */
const getProjectBySlug = async (req, res, next) => {
  try {
    const project = await Project.findOne({ slug: req.params.slug });
    
    if (!project) {
      return errorResponse(res, 404, 'Project not found');
    }
    
    // Optionally populate business details
    const business = await Business.findOne({ slug: project.business_name_slug });
    
    const responseData = {
      ...project.toObject(),
      business: business || null
    };
    
    successResponse(res, 200, responseData, 'Project retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update project
 * @route   PUT /api/v1/project/:slug
 * @access  Private/Admin
 */
const updateProject = async (req, res, next) => {
  try {
    const project = await Project.findOne({ slug: req.params.slug });
    
    if (!project) {
      return errorResponse(res, 404, 'Project not found');
    }
    
    // Validate if business exists when updating business_name_slug
    if (req.body.business_name_slug && req.body.business_name_slug !== project.business_name_slug) {
      const businessExists = await Business.findOne({ slug: req.body.business_name_slug });
      if (!businessExists) {
        return errorResponse(res, 404, 'Business not found with the provided slug');
      }
    }
    
    // Update fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined && key !== 'project_id') { // Don't allow updating project_id
        project[key] = req.body[key];
      }
    });
    
    await project.save();
    
    successResponse(res, 200, project, 'Project updated successfully');
  } catch (error) {
    if (error.code === 11000) {
      return errorResponse(res, 400, 'Project with this slug already exists');
    }
    next(error);
  }
};

/**
 * @desc    Delete project
 * @route   DELETE /api/v1/project/:slug
 * @access  Private/Admin
 */
const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findOne({ slug: req.params.slug });
    
    if (!project) {
      return errorResponse(res, 404, 'Project not found');
    }
    
    await project.deleteOne();
    
    successResponse(res, 200, null, 'Project deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProject,
  getAllProjects,
  getProjectBySlug,
  updateProject,
  deleteProject
};
