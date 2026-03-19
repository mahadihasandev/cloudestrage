const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const path = require('path');
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Strip extension from originalname to avoid double extension in Cloudinary (e.g. .pdf.pdf)
    const fileNameWithoutExt = path.parse(file.originalname).name;
    const sanitizedName = fileNameWithoutExt.replace(/[^a-zA-Z0-9.\-_]/g, '');
    
    return {
      folder: 'cloudspace_uploads',
      resource_type: 'auto', // Auto handles image, video, and raw(pdf) files
      public_id: `${Date.now()}-${sanitizedName}`
    };
  },
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit to prevent abuse
});

module.exports = upload;
