const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Generate a unique folder or filename based on user needs
    return {
      folder: 'cloudspace_uploads',
      resource_type: 'auto', // Auto handles image, video, and raw(pdf) files
      public_id: `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '')}`
    };
  },
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit to prevent abuse
});

module.exports = upload;
