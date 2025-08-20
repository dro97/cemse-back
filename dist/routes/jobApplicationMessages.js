"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const JobApplicationMessageController_1 = require("../controllers/JobApplicationMessageController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.use(auth_1.authenticateToken);
router.get("/unread-count", JobApplicationMessageController_1.getUnreadCount);
router.get("/:applicationId/messages", JobApplicationMessageController_1.getMessages);
router.post("/:applicationId/messages", JobApplicationMessageController_1.sendMessage);
router.put("/:applicationId/messages/:messageId/read", JobApplicationMessageController_1.markMessageAsRead);
exports.default = router;
//# sourceMappingURL=jobApplicationMessages.js.map