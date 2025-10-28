import express from "express";
import upload from "../../middleware/uploadMiddleware.js";

const router = express.Router();

// POST /api/uploads - single image upload
router.post("/", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  // Return the full URL to the uploaded file
  const protocol = req.protocol;
  const host = req.get('host');
  const fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;
  res.status(201).json({ url: fileUrl });
});

export default router;
