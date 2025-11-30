const mongoose = require('mongoose');

const contactUsSettingsSchema = new mongoose.Schema(
  {
    // Hero Section
    heroDescription: {
      type: String,
      required: [true, 'Hero description is required'],
      trim: true,
      maxlength: [500, 'Hero description cannot exceed 500 characters'],
    },

    // Primary Contact Information
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
    emailMessage: {
      type: String,
      trim: true,
      maxlength: [300, 'Email message cannot exceed 300 characters'],
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
      maxlength: [500, 'Address cannot exceed 500 characters'],
    },

    // Head Office Details
    headOfficeDetails: [{
      uniqueKey: {
        type: String,
        required: [true, 'Office unique key is required'],
        trim: true,
      },
      officeName: {
        type: String,
        required: [true, 'Office name is required'],
        trim: true,
        maxlength: [200, 'Office name cannot exceed 200 characters'],
      },
      officeAddress: {
        type: String,
        required: [true, 'Office address is required'],
        trim: true,
        maxlength: [500, 'Office address cannot exceed 500 characters'],
      },
      officeEmail: {
        type: String,
        required: [true, 'Office email is required'],
        lowercase: true,
        trim: true,
        match: [
          /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
          'Please provide a valid email address',
        ],
      },
      officeMobile: {
        type: String,
        required: [true, 'Office mobile is required'],
        trim: true,
        match: [/^[6-9]\d{9}$/, 'Please provide a valid 10-digit mobile number'],
      },
    }],

    // Contact Form Configuration
    contactUsFormFields: {
      name: {
        enabled: {
          type: Boolean,
          default: true,
        },
        mandatory: {
          type: Boolean,
          default: true,
        },
        label: {
          type: String,
          default: 'Name',
          trim: true,
        },
        placeholder: {
          type: String,
          default: 'Enter your name',
          trim: true,
        },
        type: {
          type: String,
          default: 'text',
          enum: ['text'],
        },
      },
      email: {
        enabled: {
          type: Boolean,
          default: true,
        },
        mandatory: {
          type: Boolean,
          default: true,
        },
        label: {
          type: String,
          default: 'Email',
          trim: true,
        },
        placeholder: {
          type: String,
          default: 'Enter your email',
          trim: true,
        },
        type: {
          type: String,
          default: 'email',
          enum: ['email'],
        },
      },
      phone: {
        enabled: {
          type: Boolean,
          default: true,
        },
        mandatory: {
          type: Boolean,
          default: true,
        },
        label: {
          type: String,
          default: 'Phone',
          trim: true,
        },
        placeholder: {
          type: String,
          default: 'Enter your phone number',
          trim: true,
        },
        type: {
          type: String,
          default: 'tel',
          enum: ['tel'],
        },
      },
      subject: {
        enabled: {
          type: Boolean,
          default: true,
        },
        mandatory: {
          type: Boolean,
          default: false,
        },
        label: {
          type: String,
          default: 'Subject',
          trim: true,
        },
        placeholder: {
          type: String,
          default: 'Enter subject',
          trim: true,
        },
        type: {
          type: String,
          default: 'text',
          enum: ['text'],
        },
      },
      message: {
        enabled: {
          type: Boolean,
          default: true,
        },
        mandatory: {
          type: Boolean,
          default: true,
        },
        label: {
          type: String,
          default: 'Message',
          trim: true,
        },
        placeholder: {
          type: String,
          default: 'Enter your message',
          trim: true,
        },
        type: {
          type: String,
          default: 'textarea',
          enum: ['textarea'],
        },
        rows: {
          type: Number,
          default: 5,
          min: [3, 'Rows must be at least 3'],
          max: [10, 'Rows cannot exceed 10'],
        },
      },
      company: {
        enabled: {
          type: Boolean,
          default: false,
        },
        mandatory: {
          type: Boolean,
          default: false,
        },
        label: {
          type: String,
          default: 'Company',
          trim: true,
        },
        placeholder: {
          type: String,
          default: 'Enter your company name',
          trim: true,
        },
        type: {
          type: String,
          default: 'text',
          enum: ['text'],
        },
      },
    },

    // Google Map
    googleMapPinLink: {
      type: String,
      trim: true,
      match: [
        /^https:\/\/(www\.)?google\.com\/maps\/.+/i,
        'Please provide a valid Google Maps link',
      ],
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

// Ensure only one contact settings document exists
contactUsSettingsSchema.pre('save', async function (next) {
  const count = await mongoose.model('ContactUsSettings').countDocuments();
  if (count > 0 && this.isNew) {
    throw new Error('Contact Us settings already exist. Please update the existing settings.');
  }
  next();
});

// Validate unique keys in headOfficeDetails array
contactUsSettingsSchema.pre('save', function(next) {
  if (this.headOfficeDetails && this.headOfficeDetails.length > 0) {
    const keys = this.headOfficeDetails.map(office => office.uniqueKey);
    const uniqueKeys = new Set(keys);
    if (keys.length !== uniqueKeys.size) {
      return next(new Error('Office unique keys must be unique'));
    }
  }
  next();
});

// Method to get enabled form fields
contactUsSettingsSchema.methods.getEnabledFormFields = function () {
  const fields = {};
  Object.keys(this.contactUsFormFields).forEach(key => {
    if (this.contactUsFormFields[key].enabled) {
      fields[key] = this.contactUsFormFields[key];
    }
  });
  return fields;
};

// Method to get mandatory form fields
contactUsSettingsSchema.methods.getMandatoryFormFields = function () {
  const fields = [];
  Object.keys(this.contactUsFormFields).forEach(key => {
    if (this.contactUsFormFields[key].enabled && this.contactUsFormFields[key].mandatory) {
      fields.push(key);
    }
  });
  return fields;
};

const ContactUsSettings = mongoose.model('ContactUsSettings', contactUsSettingsSchema);

module.exports = ContactUsSettings;
