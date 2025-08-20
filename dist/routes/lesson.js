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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const LessonController = __importStar(require("../controllers/LessonController"));
const auth_1 = require("../middleware/auth");
const minioUpload_1 = require("../middleware/minioUpload");
const router = (0, express_1.Router)();
router.use(auth_1.authenticateToken);
router.get("/", LessonController.listLessons);
router.get("/module/:moduleId", LessonController.getLessonsByModule);
router.get("/:id", LessonController.getLesson);
router.post("/", auth_1.requireOrganization, LessonController.createLesson);
router.post("/with-video", auth_1.requireOrganization, minioUpload_1.uploadLessonVideo, minioUpload_1.processAndUploadVideo, LessonController.createLesson);
router.post("/test-video", minioUpload_1.uploadLessonVideo, minioUpload_1.processAndUploadVideo, LessonController.createLesson);
router.post("/with-files", auth_1.requireOrganization, minioUpload_1.uploadLessonFiles, minioUpload_1.processAndUploadLessonFiles, LessonController.createLesson);
router.put("/:id", auth_1.requireOrganization, LessonController.updateLesson);
router.delete("/:id", auth_1.requireSuperAdmin, LessonController.deleteLesson);
exports.default = router;
//# sourceMappingURL=lesson.js.map