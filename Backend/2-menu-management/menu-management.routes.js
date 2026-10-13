const { Router } = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const router = Router();

router.get("/test", async (request, response, next) => {
  response.status(200).json({ message: "Test route is working!" });
});

const uploadsDirectory = path.join(__dirname, "..", "uploads");

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
router.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res
      .status(400)
      .json({ error: 'Please provide a file in the "file" field.' });
  }

  res.status(201).json({
    message: "File uploaded successfully.",
    file: {
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      path: req.file.path,
    },
  });
});
module.exports = { menuRoutes: router };
