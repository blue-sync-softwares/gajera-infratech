const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
  testimonial_id: {
    type: String,
    unique: true,
    trim: true
  },
  project_slug: {
    type: String,
    trim: true,
    lowercase: true
  },
  business_slug: {
    type: String,
    trim: true,
    lowercase: true
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  image: {
    url: {
      type: String
    },
    public_id: {
      type: String
    }
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  }
}, {
  timestamps: true
});

// Create indexes for faster queries
testimonialSchema.index({ project_slug: 1 });
testimonialSchema.index({ business_slug: 1 });

// Auto-generate testimonial_id before saving (format: TST + timestamp + random)
testimonialSchema.pre('save', async function(next) {
  if (this.isNew && !this.testimonial_id) {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.testimonial_id = `TST${timestamp}${random}`;
  }
  next();
});

// Virtual to check if project exists
testimonialSchema.virtual('project', {
  ref: 'Project',
  localField: 'project_slug',
  foreignField: 'slug',
  justOne: true
});

// Virtual to check if business exists
testimonialSchema.virtual('business', {
  ref: 'Business',
  localField: 'business_slug',
  foreignField: 'slug',
  justOne: true
});

module.exports = mongoose.model('Testimonial', testimonialSchema);
