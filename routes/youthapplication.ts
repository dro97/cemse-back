import express from "express";
import { 
  listYouthApplications, 
  getYouthApplication, 
  createYouthApplication, 
  updateYouthApplication, 
  deleteYouthApplication,
  sendMessage,
  getMessages,
  expressCompanyInterest,
  getCompanyInterests
} from "../controllers/YouthApplicationController";
import { authenticateToken } from "../middleware/auth";
import multer from "multer";

const router = express.Router();

// Apply authentication to all routes except test
router.use((req, res, next) => {
  if (req.path === '/test') {
    return next(); // Skip authentication for test endpoint
  }
  authenticateToken(req, res, next);
});

// Use the same multer configuration as job applications (which works)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (_req: any, file: any, cb: any) => {
    // Allow PDF files
    if (file?.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

// Use fields like job applications
const uploadFields = upload.fields([
  { name: 'cvFile', maxCount: 1 },
  { name: 'coverLetterFile', maxCount: 1 }
]);

// CRUD operations for youth applications
router.get("/", listYouthApplications);
router.post("/", uploadFields, createYouthApplication); // Para multipart/form-data con archivos
router.post("/json", createYouthApplication); // Para JSON sin archivos
router.post("/test", uploadFields, (req, res) => {
  // Simple test endpoint to verify multipart processing
  res.json({
    message: "Test endpoint working",
    body: req.body,
    files: req.files,
    contentType: req.get('Content-Type')
  });
});
router.get("/:id", getYouthApplication);
router.put("/:id", updateYouthApplication);
router.delete("/:id", deleteYouthApplication);

// Messaging system - Add JSON parsing middleware
router.post("/:id/message", express.json(), sendMessage);
router.get("/:id/messages", getMessages);

// Company interest system - Add JSON parsing middleware
router.post("/:id/company-interest", express.json(), expressCompanyInterest);
router.get("/:id/company-interests", getCompanyInterests);

export default router;
