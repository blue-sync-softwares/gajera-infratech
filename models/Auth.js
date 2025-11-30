const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Helper function to generate unique 5-character user ID
const generateUserId = () => {
  const chars = '0123456789';
  let randomPart = '';
  for (let i = 0; i < 2; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `USR${randomPart}`;
};

const authSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      uppercase: true,
      immutable: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    phone: {
      type: String,
      required: [true, 'Please provide a phone number'],
      trim: true,
      match: [
        /^[6-9]\d{9}$/,
        'Please provide a valid 10-digit phone number',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false, // Don't include password in queries by default
    },
    lastLoginTime: {
      type: Date,
      default: null,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// Index for better query performance
authSchema.index({ email: 1 });
authSchema.index({ phone: 1 });
authSchema.index({ userId: 1 });

// Generate unique userId before saving
authSchema.pre('save', async function (next) {
  // Generate userId if not already set
  if (!this.userId) {
    let isUnique = false;
    let newUserId;
    
    while (!isUnique) {
      newUserId = generateUserId();
      const existingUser = await mongoose.model('Auth').findOne({ userId: newUserId });
      if (!existingUser) {
        isUnique = true;
      }
    }
    
    this.userId = newUserId;
  }
  
  next();
});

// Hash password before saving
authSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password for login
authSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Method to update last login time
authSchema.methods.updateLastLogin = async function () {
  this.lastLoginTime = new Date();
  await this.save({ validateBeforeSave: false });
};

// Remove password from JSON response
authSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

const Auth = mongoose.model('Auth', authSchema);

module.exports = Auth;
