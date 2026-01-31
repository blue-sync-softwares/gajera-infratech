const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  project_id: {
    type: String,
    unique: true,
    trim: true
  },
  business_name_slug: {
    type: String,
    required: [true, 'Business slug is required'],
    trim: true,
    lowercase: true
  },
  project_name: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true,
    maxlength: [150, 'Project name cannot exceed 150 characters']
  },
  project_description: {
    type: String,
    required: [true, 'Project description is required'],
    trim: true
  },
  project_type: {
    type: String,
    required: [true, 'Project type is required'],
    trim: true
  },
  project_features: [{
    type: String,
    trim: true
  }],
  project_images: [{
    ranking: {
      type: Number,
      required: [true, 'Image ranking is required'],
      min: [1, 'Ranking must be at least 1']
    },
    url: {
      type: String,
      required: [true, 'Image URL is required']
    },
    public_id: {
      type: String,
      required: [true, 'Image public ID is required']
    }
  }],
  slug: {
    type: String,
    required: [true, 'Slug is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens']
  },
  hero_image: {
    url: {
      type: String,
      required: [true, 'Hero image URL is required']
    },
    public_id: {
      type: String,
      required: [true, 'Hero image public ID is required']
    }
  },
  project_detail: {
    image: {
      url: {
        type: String,
        required: [true, 'Project detail image URL is required']
      },
      public_id: {
        type: String,
        required: [true, 'Project detail image public ID is required']
      }
    },
    title: {
      type: String,
      required: [true, 'Project detail title is required'],
      trim: true,
      maxlength: [150, 'Project detail title cannot exceed 150 characters']
    },
    description: {
      type: String,
      required: [true, 'Project detail description is required'],
      trim: true
    }
  },
  project_document: [{
    image: {
      url: {
        type: String,
        required: [true, 'Document image URL is required']
      },
      public_id: {
        type: String,
        required: [true, 'Document image public ID is required']
      }
    },
    title: {
      type: String,
      required: [true, 'Document title is required'],
      trim: true,
      maxlength: [150, 'Document title cannot exceed 150 characters']
    },
    description: {
      type: String,
      required: [true, 'Document description is required'],
      trim: true,
      maxlength: [500, 'Document description cannot exceed 500 characters']
    },
    file_name: {
      type: String,
      required: [true, 'File name is required'],
      trim: true
    },
    file_link: {
      url: {
        type: String,
        required: [true, 'File URL is required']
      },
      public_id: {
        type: String,
        required: [true, 'File public ID is required']
      }
    },
    button_title: {
      type: String,
      trim: true,
      maxlength: [50, 'Button title cannot exceed 50 characters'],
      default: 'Download'
    },
    download_message: {
      type: String,
      trim: true,
      maxlength: [200, 'Download message cannot exceed 200 characters']
    }
  }]
}, {
  timestamps: true
});

// Create indexes for faster queries
projectSchema.index({ business_name_slug: 1 });
projectSchema.index({ project_type: 1 });

// Auto-generate project_id before saving (format: PRJ + timestamp + random)
projectSchema.pre('save', async function() {
  if (this.isNew && !this.project_id) {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.project_id = `PRJ${timestamp}${random}`;
  }
  // next();
});

// Generate slug from project name if not provided
projectSchema.pre('validate', function() {
  if (!this.slug && this.project_name) {
    this.slug = this.project_name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
  // next();
});

// Validate unique rankings in project_images array
projectSchema.pre('save', function() {
  if (this.project_images && this.project_images.length > 0) {
    const rankings = this.project_images.map(img => img.ranking);
    const uniqueRankings = new Set(rankings);
    if (rankings.length !== uniqueRankings.size) {
      return next(new Error('All image rankings must be unique'));
    }
  }
  // next();
});

// Virtual to check if business exists
projectSchema.virtual('business', {
  ref: 'Business',
  localField: 'business_name_slug',
  foreignField: 'slug',
  justOne: true
});

module.exports = mongoose.model('Project', projectSchema);
