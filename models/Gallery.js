const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
  gallery_id: {
    type: String,
    unique: true,
    trim: true
  },
  image: {
    url: {
      type: String,
      required: [true, 'Image URL is required']
    },
    public_id: {
      type: String,
      required: [true, 'Image public ID is required']
    }
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [150, 'Title cannot exceed 150 characters']
  },
  tag: {
    type: String,
    trim: true,
    lowercase: true,
    maxlength: [50, 'Tag cannot exceed 50 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  altText: {
    type: String,
    trim: true,
    maxlength: [100, 'Alt text cannot exceed 100 characters']
  },
  category: {
    type: String,
    trim: true,
    maxlength: [50, 'Category cannot exceed 50 characters']
  },
  width: {
    type: Number,
    min: [1, 'Width must be at least 1']
  },
  height: {
    type: Number,
    min: [1, 'Height must be at least 1']
  },
  fileSize: {
    type: Number,
    min: [0, 'File size cannot be negative']
  },
  format: {
    type: String,
    trim: true,
    uppercase: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Create indexes for faster queries
gallerySchema.index({ tag: 1 });
gallerySchema.index({ category: 1 });
gallerySchema.index({ isActive: 1 });

// Auto-generate gallery_id before saving (format: GAL + timestamp + random)
gallerySchema.pre('save', async function(next) {
  if (this.isNew && !this.gallery_id) {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.gallery_id = `GAL${timestamp}${random}`;
  }
  next();
});

module.exports = mongoose.model('Gallery', gallerySchema);
