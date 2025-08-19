"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const JobApplicationController_1 = require("../controllers/JobApplicationController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.use(auth_1.authenticateToken);
router.get("/", JobApplicationController_1.listJobApplications);
router.get("/:id", JobApplicationController_1.getJobApplication);
router.post("/", JobApplicationController_1.createJobApplication);
router.put("/:id", JobApplicationController_1.updateJobApplication);
router.delete("/:id", JobApplicationController_1.deleteJobApplication);
exports.default = router;
//# sourceMappingURL=jobapplication.js.map