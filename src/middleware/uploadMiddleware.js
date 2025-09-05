// filepath: src/middleware/uploadMiddleware.js
import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure uploads folder exists
const uploadPath = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });

// Configure Multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadPath),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const name = file.fieldname + "-" + Date.now() + ext;
        cb(null, name);
    },
});

// Filter: only images
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed"), false);
};

// Export multer instance
const upload = multer({ storage, fileFilter });

export default upload;
