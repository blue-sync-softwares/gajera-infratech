const mongoose = require('mongoose');

const aboutUsSettingsSchema = new mongoose.Schema({
  heroDescription: {
    type: String,
    required: [true, 'Hero description is required'],
    trim: true,
    maxlength: [500, 'Hero description cannot exceed 500 characters']
  },
  missionStatement: {
    type: String,
    required: [true, 'Mission statement is required'],
    trim: true,
    maxlength: [200, 'Mission statement cannot exceed 200 characters']
  },
  missionDescription: {
    type: String,
    required: [true, 'Mission description is required'],
    trim: true,
    maxlength: [1000, 'Mission description cannot exceed 1000 characters']
  },
  values: [{
    uniqueKey: {
      type: String,
      required: [true, 'Value unique key is required'],
      trim: true
    },
    title: {
      type: String,
      required: [true, 'Value title is required'],
      trim: true,
      maxlength: [100, 'Value title cannot exceed 100 characters']
    },
    description: {
      type: String,
      required: [true, 'Value description is required'],
      trim: true,
      maxlength: [500, 'Value description cannot exceed 500 characters']
    }
  }],
  history: [{
    year: {
      type: Number,
      required: [true, 'History year is required'],
      min: [1900, 'Year must be 1900 or later'],
      max: [new Date().getFullYear() + 10, 'Year cannot be more than 10 years in the future']
    },
    title: {
      type: String,
      required: [true, 'History title is required'],
      trim: true,
      maxlength: [100, 'History title cannot exceed 100 characters']
    },
    description: {
      type: String,
      required: [true, 'History description is required'],
      trim: true,
      maxlength: [500, 'History description cannot exceed 500 characters']
    }
  }],
  companyStatistics: [{
    uniqueKey: {
      type: String,
      required: [true, 'Statistic unique key is required'],
      trim: true
    },
    title: {
      type: String,
      required: [true, 'Statistic title is required'],
      trim: true,
      maxlength: [100, 'Statistic title cannot exceed 100 characters']
    },
    statValue: {
      type: String,
      required: [true, 'Statistic value is required'],
      trim: true,
      maxlength: [50, 'Statistic value cannot exceed 50 characters']
    }
  }],
  leadershipDetails: [{
    uniqueKey: {
      type: String,
      required: [true, 'Leadership unique key is required'],
      trim: true
    },
    name: {
      type: String,
      required: [true, 'Leader name is required'],
      trim: true,
      maxlength: [100, 'Leader name cannot exceed 100 characters']
    },
    designation: {
      type: String,
      required: [true, 'Leader designation is required'],
      trim: true,
      maxlength: [100, 'Leader designation cannot exceed 100 characters']
    },
    profileImage: {
      url: {
        type: String,
        required: [true, 'Profile image URL is required']
      },
      public_id: {
        type: String,
        required: [true, 'Profile image public ID is required']
      }
    }
  }],
  featuredTestimonial: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Testimonial'
  }
}, {
  timestamps: true
});

// Validate max 4 values
aboutUsSettingsSchema.pre('save', function(next) {
  if (this.values && this.values.length > 4) {
    return next(new Error('Maximum 4 values are allowed'));
  }
  next();
});

// Validate unique keys in values array
aboutUsSettingsSchema.pre('save', function(next) {
  if (this.values && this.values.length > 0) {
    const keys = this.values.map(v => v.uniqueKey);
    const uniqueKeys = new Set(keys);
    if (keys.length !== uniqueKeys.size) {
      return next(new Error('All value unique keys must be unique'));
    }
  }
  next();
});

// Validate unique years in history array
aboutUsSettingsSchema.pre('save', function(next) {
  if (this.history && this.history.length > 0) {
    const years = this.history.map(h => h.year);
    const uniqueYears = new Set(years);
    if (years.length !== uniqueYears.size) {
      return next(new Error('All history years must be unique'));
    }
  }
  next();
});

// Validate unique keys in companyStatistics array
aboutUsSettingsSchema.pre('save', function(next) {
  if (this.companyStatistics && this.companyStatistics.length > 0) {
    const keys = this.companyStatistics.map(s => s.uniqueKey);
    const uniqueKeys = new Set(keys);
    if (keys.length !== uniqueKeys.size) {
      return next(new Error('All company statistic unique keys must be unique'));
    }
  }
  next();
});

// Validate unique keys in leadershipDetails array
aboutUsSettingsSchema.pre('save', function(next) {
  if (this.leadershipDetails && this.leadershipDetails.length > 0) {
    const keys = this.leadershipDetails.map(l => l.uniqueKey);
    const uniqueKeys = new Set(keys);
    if (keys.length !== uniqueKeys.size) {
      return next(new Error('All leadership unique keys must be unique'));
    }
  }
  next();
});

// Ensure only one settings document exists (singleton pattern)
aboutUsSettingsSchema.pre('save', async function(next) {
  if (this.isNew) {
    const count = await mongoose.models.AboutUsSettings.countDocuments();
    if (count > 0) {
      return next(new Error('About Us settings already exist. Use update instead.'));
    }
  }
  next();
});

module.exports = mongoose.model('AboutUsSettings', aboutUsSettingsSchema);
