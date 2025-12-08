const mongoose = require('mongoose');

const websiteSettingsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Website title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    tagline: {
      type: String,
      trim: true,
      maxlength: [200, 'Tagline cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    logo: {
      url: {
        type: String,
        required: [true, 'Logo URL is required'],
      },
      public_id: {
        type: String,
        required: [true, 'Logo public_id is required'],
      },
    },
    favicon: {
      url: {
        type: String,
      },
      public_id: {
        type: String,
      },
    },
    businessInfo: {
      name: {
        type: String,
        required: [true, 'Business name is required'],
        trim: true,
        maxlength: [200, 'Business name cannot exceed 200 characters'],
      },
      address: {
        street: {
          type: String,
          required: [true, 'Street address is required'],
          trim: true,
        },
        city: {
          type: String,
          required: [true, 'City is required'],
          trim: true,
        },
        state: {
          type: String,
          required: [true, 'State is required'],
          trim: true,
        },
        pincode: {
          type: String,
          required: [true, 'Pincode is required'],
          trim: true,
          match: [/^\d{6}$/, 'Please provide a valid 6-digit pincode'],
        },
        country: {
          type: String,
          required: [true, 'Country is required'],
          trim: true,
          default: 'India',
        },
      },
      phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true,
        match: [/^[6-9]\d{9}$/, 'Please provide a valid 10-digit phone number'],
      },
     
      email: {
        type: String,
        required: [true, 'Email is required'],
        lowercase: true,
        trim: true,
        match: [
          /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
          'Please provide a valid email address',
        ],
      },
     
      
    },
    socialMedia: {
      facebook: {
        type: String,
        trim: true,
        match: [
          /^(https?:\/\/)?(www\.)?facebook\.com\/.+/i,
          'Please provide a valid Facebook URL',
        ],
      },
      instagram: {
        type: String,
        trim: true,
        match: [
          /^(https?:\/\/)?(www\.)?instagram\.com\/.+/i,
          'Please provide a valid Instagram URL',
        ],
      },
      twitter: {
        type: String,
        trim: true,
        match: [
          /^(https?:\/\/)?(www\.)?twitter\.com\/.+/i,
          'Please provide a valid Twitter URL',
        ],
      },
      linkedin: {
        type: String,
        trim: true,
        match: [
          /^(https?:\/\/)?(www\.)?linkedin\.com\/.+/i,
          'Please provide a valid LinkedIn URL',
        ],
      },
      youtube: {
        type: String,
        trim: true,
        match: [
          /^(https?:\/\/)?(www\.)?youtube\.com\/.+/i,
          'Please provide a valid YouTube URL',
        ],
      },
      whatsapp: {
        type: String,
        trim: true,
        match: [/^[6-9]\d{9}$/, 'Please provide a valid 10-digit WhatsApp number'],
      },
    },
    
    seo: {
      metaTitle: {
        type: String,
        trim: true,
        maxlength: [60, 'Meta title cannot exceed 60 characters'],
      },
      metaDescription: {
        type: String,
        trim: true,
        maxlength: [160, 'Meta description cannot exceed 160 characters'],
      },
      metaKeywords: [{
        type: String,
        trim: true,
      }],
    },
    copyright: {
      type: String,
      trim: true,
      default: '© 2025 All rights reserved',
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

// Ensure only one settings document exists
websiteSettingsSchema.pre('save', async function () {
  const count = await mongoose.model('WebsiteSettings').countDocuments();
  if (count > 0 && this.isNew) {
    throw new Error('Website settings already exist. Please update the existing settings.');
  }
});

// Method to get full address as string
websiteSettingsSchema.methods.getFullAddress = function () {
  const addr = this.businessInfo.address;
  return `${addr.street}, ${addr.city}, ${addr.state} - ${addr.pincode}, ${addr.country}`;
};

const WebsiteSettings = mongoose.model('WebsiteSettings', websiteSettingsSchema);

module.exports = WebsiteSettings;
