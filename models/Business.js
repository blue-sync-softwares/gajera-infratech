const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema({
  slug: {
    type: String,
    required: [true, 'Slug is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens']
  },
  business_title: {
    type: String,
    required: [true, 'Business title is required'],
    trim: true,
    maxlength: [150, 'Business title cannot exceed 150 characters']
  },
  business_overview: {
    type: String,
    required: [true, 'Business overview is required'],
    trim: true,
    maxlength: [700, 'Business overview cannot exceed 700 characters']
  },
  business_description: {
    type: String,
    required: [true, 'Business description is required'],
    trim: true
  },
  business_tagline: {
    type: String,
    trim: true,
    maxlength: [200, 'Business tagline cannot exceed 200 characters']
  },
  ctaTitle: {
    type: String,
    trim: true,
    maxlength: [100, 'CTA title cannot exceed 100 characters']
  },
  ctaHref: {
    type: String,
    trim: true
  },
  business_gallery: [{
    image_title: {
      type: String,
      required: [true, 'Gallery image title is required'],
      trim: true,
      maxlength: [100, 'Gallery image title cannot exceed 100 characters']
    },
    image_src: {
      url: {
        type: String,
        required: [true, 'Gallery image URL is required']
      },
      public_id: {
        type: String,
        required: [true, 'Gallery image public ID is required']
      }
    }
  }],
  business_testimonials: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Testimonial'
  }],
  project_types: [{
    type: String,
    trim: true
  }],
  project_details: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  }],
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
  featured_image: {
    url: {
      type: String,
      required: [true, 'Featured image URL is required']
    },
    public_id: {
      type: String,
      required: [true, 'Featured image public ID is required']
    }
  },
  businessStats: [{
    uniqueKey: {
      type: String,
      required: [true, 'Stat unique key is required'],
      trim: true
    },
    title: {
      type: String,
      required: [true, 'Stat title is required'],
      trim: true,
      maxlength: [100, 'Stat title cannot exceed 100 characters']
    },
    statValue: {
      type: String,
      required: [true, 'Stat value is required'],
      trim: true,
      maxlength: [50, 'Stat value cannot exceed 50 characters']
    }
  }],
  callToActionSection: {
    title: {
      type: String,
      trim: true,
      maxlength: [150, 'CTA section title cannot exceed 150 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'CTA section description cannot exceed 500 characters']
    },
    buttonTitle: {
      type: String,
      trim: true,
      maxlength: [50, 'CTA button title cannot exceed 50 characters']
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

// Validate unique keys in businessStats array
businessSchema.pre('save', function(next) {
  if (this.businessStats && this.businessStats.length > 0) {
    const keys = this.businessStats.map(s => s.uniqueKey);
    const uniqueKeys = new Set(keys);
    if (keys.length !== uniqueKeys.size) {
      return next(new Error('All business stat unique keys must be unique'));
    }
  }
  next();
});

// Generate slug from business title if not provided
businessSchema.pre('validate', function(next) {
  if (!this.slug && this.business_title) {
    this.slug = this.business_title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
  next();
});

module.exports = mongoose.model('Business', businessSchema);
