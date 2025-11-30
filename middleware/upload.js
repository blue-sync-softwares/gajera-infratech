const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename: timestamp-randomstring-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    cb(null, `${nameWithoutExt}-${uniqueSuffix}${ext}`);
  }
});

// File filter for validation
const fileFilter = (req, file, cb) => {
  // Allowed image formats
  const allowedImageTypes = /jpeg|jpg|png|gif|webp|svg/;
  // Allowed video formats
  const allowedVideoTypes = /mp4|avi|mov|wmv|flv|mkv/;
  // Allowed document formats
  const allowedDocTypes = /pdf|doc|docx|xls|xlsx|ppt|pptx|txt/;

  const extname = path.extname(file.originalname).toLowerCase().slice(1);
  const mimetype = file.mimetype;

  // Check if file type is allowed
  const isImage = allowedImageTypes.test(extname) && mimetype.startsWith('image/');
  const isVideo = allowedVideoTypes.test(extname) && mimetype.startsWith('video/');
  const isDocument = allowedDocTypes.test(extname) || mimetype.startsWith('application/');

  if (isImage || isVideo || isDocument) {
    cb(null, true);
  } else {
    cb(new Error(`File type not supported. Uploaded file type: ${extname}`), false);
  }
};

// Multer configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

// Multer configurations for different use cases

// Single file upload
const uploadSingle = (fieldName) => upload.single(fieldName);

// Multiple files upload (same field)
const uploadMultiple = (fieldName, maxCount = 10) => upload.array(fieldName, maxCount);

// Multiple files with different fields
const uploadFields = (fields) => upload.fields(fields);
// Example: uploadFields([{ name: 'avatar', maxCount: 1 }, { name: 'gallery', maxCount: 5 }])

// Image only upload
const imageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    cb(null, `${nameWithoutExt}-${uniqueSuffix}${ext}`);
  }
});

const imageFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = path.extname(file.originalname).toLowerCase().slice(1);
  const mimetype = file.mimetype;

  if (allowedTypes.test(extname) && mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'), false);
  }
};

const uploadImage = multer({
  storage: imageStorage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB for images
  }
});

const uploadSingleImage = (fieldName) => uploadImage.single(fieldName);
const uploadMultipleImages = (fieldName, maxCount = 10) => uploadImage.array(fieldName, maxCount);

// Video only upload
const videoStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    cb(null, `${nameWithoutExt}-${uniqueSuffix}${ext}`);
  }
});

const videoFilter = (req, file, cb) => {
  const allowedTypes = /mp4|avi|mov|wmv|flv|mkv/;
  const extname = path.extname(file.originalname).toLowerCase().slice(1);
  const mimetype = file.mimetype;

  if (allowedTypes.test(extname) && mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Only video files are allowed (mp4, avi, mov, wmv, flv, mkv)'), false);
  }
};

const uploadVideo = multer({
  storage: videoStorage,
  fileFilter: videoFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB for videos
  }
});

const uploadSingleVideo = (fieldName) => uploadVideo.single(fieldName);

module.exports = {
  upload,
  uploadSingle,
  uploadMultiple,
  uploadFields,
  uploadSingleImage,
  uploadMultipleImages,
  uploadSingleVideo,
  uploadDir,
};
