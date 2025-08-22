"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const YouthApplicationController_1 = require("../controllers/YouthApplicationController");
const auth_1 = require("../middleware/auth");
const multer_1 = __importDefault(require("multer"));
const router = express_1.default.Router();
router.use((req, res, next) => {
    if (req.path === '/test') {
        return next();
    }
    (0, auth_1.authenticateToken)(req, res, next);
});
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
const uploadFields = upload.fields([
    { name: 'cvFile', maxCount: 1 },
    { name: 'coverLetterFile', maxCount: 1 }
]);
router.get("/", YouthApplicationController_1.listYouthApplications);
router.post("/", uploadFields, YouthApplicationController_1.createYouthApplication);
router.post("/json", YouthApplicationController_1.createYouthApplication);
router.post("/test", uploadFields, (req, res) => {
    res.json({
        message: "Test endpoint working",
        body: req.body,
        files: req.files,
        contentType: req.get('Content-Type')
    });
});
router.get("/:id", YouthApplicationController_1.getYouthApplication);
router.put("/:id", YouthApplicationController_1.updateYouthApplication);
router.delete("/:id", YouthApplicationController_1.deleteYouthApplication);
router.post("/:id/message", express_1.default.json(), YouthApplicationController_1.sendMessage);
router.get("/:id/messages", YouthApplicationController_1.getMessages);
router.post("/:id/company-interest", express_1.default.json(), YouthApplicationController_1.expressCompanyInterest);
router.get("/:id/company-interests", YouthApplicationController_1.getCompanyInterests);
exports.default = router;
//# sourceMappingURL=youthapplication.js.map