import express from "express";
import { createPreRelease, getMyPreReleases } from "../../controllers/posControllers/preReleaseController.js";
// import upload from "../../middleware/uploadMiddleware.js"; // Uncomment if you use multer for file upload
import { authenticateToken } from "../../middleware/authMiddleware.js";

const router = express.Router();

// POST /api/pos/pre-release (with file upload if needed)
// router.post("/pre-release", authenticateToken, upload.single("photo"), createPreRelease);
router.post("/pre-release", authenticateToken, createPreRelease);

// GET /api/pos/pre-release (list for current user)
router.get("/pre-release", authenticateToken, getMyPreReleases);

export default router;
