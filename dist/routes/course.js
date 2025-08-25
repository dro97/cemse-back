"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const minioUpload_1 = require("../middleware/minioUpload");
const CourseController = __importStar(require("../controllers/CourseController"));
const router = express_1.default.Router();
router.use(auth_1.authenticateToken);
router.get("/", CourseController.listCourses);
router.get("/:id", CourseController.getCourse);
router.get("/:id/preview", CourseController.getCoursePreview);
const requireCourseCreation = (req, res, next) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({ message: "Authentication required" });
    }
    if (user.role === 'SUPERADMIN') {
        return next();
    }
    if (user.role && ['COMPANIES', 'MUNICIPAL_GOVERNMENTS', 'TRAINING_CENTERS', 'NGOS_AND_FOUNDATIONS'].includes(user.role)) {
        return next();
    }
    if (user.type === 'municipality') {
        return next();
    }
    return res.status(403).json({
        message: "Access denied. Only SuperAdmin, Organizations, and Municipalities can create courses"
    });
};
router.post("/", requireCourseCreation, minioUpload_1.uploadCourseFilesToMinIO, CourseController.createCourse);
router.post("/json", requireCourseCreation, CourseController.createCourse);
router.put("/:id", requireCourseCreation, minioUpload_1.uploadCourseFilesToMinIO, CourseController.updateCourse);
router.delete("/:id", auth_1.requireSuperAdmin, CourseController.deleteCourse);
exports.default = router;
//# sourceMappingURL=course.js.map