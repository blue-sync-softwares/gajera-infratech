const express = require('express');
const router = express.Router();
const { uploadSingleToCloudinary, uploadMultipleFilesToCloudinary } = require('../middleware/cloudinaryUpload');
const { uploadSingle, uploadMultiple, deleteFile, getFile, getFolderFiles } = require('../controllers/uploadController');

// Upload single file
router.post('/single', uploadSingleToCloudinary('file', 'uploads'), uploadSingle);

// Upload multiple files
router.post('/multiple', uploadMultipleFilesToCloudinary('files', 'uploads', 10), uploadMultiple);

// Delete file
router.delete('/:publicId', deleteFile);

// Get file details
router.get('/file/:publicId', getFile);

// Get all files from folder
router.get('/folder/:folderName', getFolderFiles);

module.exports = router;
