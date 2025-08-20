"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const JobApplicationController_1 = require("../controllers/JobApplicationController");
const auth_1 = require("../middleware/auth");
const multer_1 = __importDefault(require("multer"));
const router = express_1.default.Router();
router.use(auth_1.authenticateToken);
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
    fileFilter: (_req, file, cb) => {
        if (file?.mimetype === 'application/pdf') {
            cb(null, true);
        }
        else {
            cb(new Error('Only PDF files are allowed'));
        }
    }
});
router.get("/", JobApplicationController_1.listJobApplications);
router.get("/by-job-offer", JobApplicationController_1.getApplicationsByJobOffer);
router.get("/test-auth", JobApplicationController_1.testAuth);
router.get("/check-application/:jobOfferId", JobApplicationController_1.checkApplicationStatus);
router.get("/:id", JobApplicationController_1.getJobApplication);
router.post("/", upload.fields([
    { name: 'cvFile', maxCount: 1 },
    { name: 'coverLetterFile', maxCount: 1 }
]), JobApplicationController_1.createJobApplication);
router.put("/:id", JobApplicationController_1.updateJobApplication);
router.put("/:id/status", JobApplicationController_1.updateApplicationStatus);
router.delete("/:id", JobApplicationController_1.deleteJobApplication);
exports.default = router;
//# sourceMappingURL=jobapplication.js.map