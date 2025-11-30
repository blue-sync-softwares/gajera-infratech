const mongoose = require('mongoose');

const homeSettingsSchema = new mongoose.Schema(
  {
    // Hero Section
    heroTitle: {
      type: String,
      required: [true, 'Hero title is required'],
      trim: true,
      maxlength: [200, 'Hero title cannot exceed 200 characters'],
    },
    heroDescription: {
      type: String,
      required: [true, 'Hero description is required'],
      trim: true,
      maxlength: [500, 'Hero description cannot exceed 500 characters'],
    },

    // Featured Projects Section
    featuredProjects: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
    }],

    // Features Section
    featureTitle: {
      type: String,
      required: [true, 'Feature title is required'],
      trim: true,
      maxlength: [200, 'Feature title cannot exceed 200 characters'],
    },
    featureDescription: {
      type: String,
      required: [true, 'Feature description is required'],
      trim: true,
      maxlength: [500, 'Feature description cannot exceed 500 characters'],
    },
    features: {
      type: [{
        key: {
          type: String,
          required: [true, 'Feature key is required'],
          unique: true,
          trim: true,
        },
        title: {
          type: String,
          required: [true, 'Feature item title is required'],
          trim: true,
          maxlength: [100, 'Feature item title cannot exceed 100 characters'],
        },
        description: {
          type: String,
          required: [true, 'Feature item description is required'],
          trim: true,
          maxlength: [300, 'Feature item description cannot exceed 300 characters'],
        },
        image: {
          url: {
            type: String,
            required: [true, 'Feature image URL is required'],
          },
          public_id: {
            type: String,
            required: [true, 'Feature image public_id is required'],
          },
        },
      }],
      validate: {
        validator: function(arr) {
          return arr.length <= 3;
        },
        message: 'Features array cannot have more than 3 items',
      },
    },

    // Legacy Section
    legacyTitle: {
      type: String,
      required: [true, 'Legacy title is required'],
      trim: true,
      maxlength: [200, 'Legacy title cannot exceed 200 characters'],
    },
    legacyDescription: {
      type: String,
      required: [true, 'Legacy description is required'],
      trim: true,
      maxlength: [1000, 'Legacy description cannot exceed 1000 characters'],
    },
    legacyAwardTitle: {
      type: String,
      trim: true,
      maxlength: [100, 'Legacy award title cannot exceed 100 characters'],
    },
    legacyAwardYears: {
      type: String,
      trim: true,
      maxlength: [50, 'Award years cannot exceed 50 characters'],
    },

    // Testimonials Section
    topTestimonial: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Testimonial',
    },

    // Metrics Section
    metrics: {
      type: [{
        key: {
          type: String,
          required: [true, 'Metric key is required'],
          unique: true,
          trim: true,
        },
        title: {
          type: String,
          required: [true, 'Metric title is required'],
          trim: true,
          maxlength: [100, 'Metric title cannot exceed 100 characters'],
        },
        metricValue: {
          type: String,
          required: [true, 'Metric value is required'],
          trim: true,
          maxlength: [50, 'Metric value cannot exceed 50 characters'],
        },
      }],
      validate: {
        validator: function(arr) {
          return arr.length <= 3;
        },
        message: 'Metrics array cannot have more than 3 items',
      },
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure only one home settings document exists
homeSettingsSchema.pre('save', async function (next) {
  const count = await mongoose.model('HomeSettings').countDocuments();
  if (count > 0 && this.isNew) {
    throw new Error('Home settings already exist. Please update the existing settings.');
  }
  next();
});

// Validate unique keys in features array
homeSettingsSchema.pre('save', function(next) {
  if (this.features && this.features.length > 0) {
    const keys = this.features.map(f => f.key);
    const uniqueKeys = new Set(keys);
    if (keys.length !== uniqueKeys.size) {
      return next(new Error('Feature keys must be unique'));
    }
  }
  next();
});

// Validate unique keys in metrics array
homeSettingsSchema.pre('save', function(next) {
  if (this.metrics && this.metrics.length > 0) {
    const keys = this.metrics.map(m => m.key);
    const uniqueKeys = new Set(keys);
    if (keys.length !== uniqueKeys.size) {
      return next(new Error('Metric keys must be unique'));
    }
  }
  next();
});

const HomeSettings = mongoose.model('HomeSettings', homeSettingsSchema);

module.exports = HomeSettings;
