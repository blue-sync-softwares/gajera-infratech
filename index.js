const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');
const { successResponse, errorResponse } = require('./utils/response');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration
const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser
app.use(cookieParser());

// Compression middleware
app.use(compression());

// Logging middleware (only in development)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check route
app.get('/health', (req, res) => {
  successResponse(res, 200, { timestamp: new Date().toISOString() }, 'Server is running');
});

// API routes
app.use('/api/v1/upload', require('./routes/upload'));
app.use('/api/v1/auth', require('./routes/auth'));
app.use('/api/v1/website/settings', require('./routes/websiteSettings'));
app.use('/api/v1/website/home-settings', require('./routes/homeSettings'));
app.use('/api/v1/website/contact-us-settings', require('./routes/contactUsSettings'));
app.use('/api/v1/website/about-us-settings', require('./routes/aboutUsSettings'));
app.use('/api/v1/business', require('./routes/business'));
app.use('/api/v1/project', require('./routes/project'));
app.use('/api/v1/testimonial', require('./routes/testimonial'));
app.use('/api/v1/gallery', require('./routes/gallery'));
app.use('/api/v1/users', require('./routes/users'));

// 404 handler
app.use((req, res, next) => {
  errorResponse(res, 404, 'Route not found');
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, '0.0.0.0',() => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

module.exports = app;
