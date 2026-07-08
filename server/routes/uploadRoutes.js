const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { S3Client } = require('@aws-sdk/client-s3');
const multerS3 = require('multer-s3');

const router = express.Router();

let upload;

// If S3 bucket is configured, use S3 for storage
if (process.env.AWS_S3_BUCKET_NAME) {
  const s3Config = {
    region: process.env.AWS_REGION || 'ap-south-1',
  };
  
  // Only explicitly set credentials if provided in env (otherwise rely on IAM Role)
  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    s3Config.credentials = {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    };
  }
  
  const s3 = new S3Client(s3Config);

  upload = multer({
    storage: multerS3({
      s3: s3,
      bucket: process.env.AWS_S3_BUCKET_NAME,
      contentType: multerS3.AUTO_CONTENT_TYPE,
      metadata: function (req, file, cb) {
        cb(null, { fieldName: file.fieldname });
      },
      key: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
      }
    }),
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB
  });
  console.log('☁️ Uploads configured for AWS S3');
} else {
  // Fallback to local disk storage
  const uploadDir = path.join(__dirname, '../../public/uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  });

  upload = multer({ 
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 }
  });
  console.log('📁 Uploads configured for Local Disk');
}

// Upload route
router.post('/', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Whether S3 (req.file.key) or Local (req.file.filename), we return the same format
    const filename = req.file.key || req.file.filename;
    
    // Return the relative path so existing frontend code works perfectly
    const fileUrl = `/uploads/${filename}`;

    res.status(200).json({ 
      success: true, 
      message: 'File uploaded successfully',
      fileUrl: fileUrl,
      fileName: req.file.originalname
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, message: 'File upload failed' });
  }
});

module.exports = router;
