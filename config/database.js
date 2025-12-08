const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Create default admin user if no users exist
    await createDefaultAdmin();
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

// Create default admin user
const createDefaultAdmin = async () => {
  try {
    const Auth = require('../models/Auth');

    // Check if any users exist
    const userCount = await Auth.countDocuments();

    if (userCount === 0) {
      console.log('No users found. Creating default admin user...');

      // Create default admin user
      const defaultAdmin = await Auth.create({
        userId: 'ADM01',
        name: 'Master Admin',
        email: 'admin@gajera-infratech.com',
        phone: '9999999999',
        password: 'Admin@2025@jimish',
        role: 'admin',
        isActive: true
      });

      console.log(`Default admin user created successfully with userId: ${defaultAdmin.userId}`);
      console.log('You can now login with userId: ADM01 and password: Admin@2025@jimish');
    }
  } catch (error) {
    console.error(`Error creating default admin user: ${error.message}`);
  }
};

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error(`Mongoose connection error: ${err}`);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected from MongoDB');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('Mongoose connection closed due to application termination');
  process.exit(0);
});

module.exports = connectDB;
