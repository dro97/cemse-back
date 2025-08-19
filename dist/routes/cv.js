"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const CVController_1 = require("../controllers/CVController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.use(auth_1.authenticateToken);
router.get("/", CVController_1.getUserCV);
router.put("/", CVController_1.updateUserCV);
router.get("/cover-letter", CVController_1.getUserCoverLetter);
router.post("/cover-letter", CVController_1.saveUserCoverLetter);
router.post("/generate-for-application", CVController_1.generateCVForApplication);
exports.default = router;
//# sourceMappingURL=cv.js.map