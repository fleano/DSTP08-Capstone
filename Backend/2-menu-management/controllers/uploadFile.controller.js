/**
 * Upload file controller
 * @param {import('express').Request} request Incoming HTTP request.
 * @param {import('express').Response} response Outgoing HTTP response.
 */
const uploadFile = (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      error: 'Please provide a file in the "file" field.',
    });
  }

  return res.status(201).json({
    message: "File uploaded successfully.",
    file: {
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      path: req.file.path,
    },
  });
};

module.exports = {
  uploadFile,
};
