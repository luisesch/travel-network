const cloudinary = require("cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

console.log(cloudinary);

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  folder: "travel-network", // The name of the folder in cloudinary
  allowedFormats: ["jpg", "png"],
  filename: function (req, file, cb) {
    cb(null, file.originalname); // The file on cloudinary would have the same name as the original file name
  },
});

console.log("DEBUG");

const uploadCloud = multer({ storage: storage });

module.exports = uploadCloud;
