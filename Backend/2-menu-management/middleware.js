const path = require("path");
const fs = require("fs");
const multer = require("multer");

const uploadsDirectory = path.join(__dirname, "..", "uploads", "foodImages");

fs.mkdirSync(uploadsDirectory, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadsDirectory,
  filename: (req, file, callback) => {
    const extension = path.extname(file.originalname);

    const baseName = path
      .basename(file.originalname, extension)
      .replace(/[^a-z0-9_-]/gi, "-");

    callback(null, `${Date.now()}-${baseName}${extension}`);
  },
});

const upload = multer({ storage });

module.exports = { upload };
