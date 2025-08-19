import express from "express";
import { listJobApplications, getJobApplication, createJobApplication, updateJobApplication, deleteJobApplication, testAuth, getApplicationsByJobOffer, checkApplicationStatus, updateApplicationStatus } from "../controllers/JobApplicationController";
import { authenticateToken } from "../middleware/auth";
import multer from "multer";

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow PDF files
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

router.get("/", listJobApplications);
router.get("/by-job-offer", getApplicationsByJobOffer);
router.get("/test-auth", testAuth);
router.get("/check-application/:jobOfferId", checkApplicationStatus);
router.get("/:id", getJobApplication);
router.post("/", upload.fields([
  { name: 'cvFile', maxCount: 1 },
  { name: 'coverLetterFile', maxCount: 1 }
]), createJobApplication);
router.put("/:id", updateJobApplication);
router.put("/:id/status", updateApplicationStatus);
router.delete("/:id", deleteJobApplication);

export default router;
