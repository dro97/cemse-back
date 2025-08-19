import express from "express";
import { 
  getMessages, 
  sendMessage, 
  markMessageAsRead, 
  getUnreadCount 
} from "../controllers/JobApplicationMessageController";
import { authenticateToken } from "../middleware/auth";

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Routes for job application messages
router.get("/unread-count", getUnreadCount);
router.get("/:applicationId/messages", getMessages);
router.post("/:applicationId/messages", sendMessage);
router.put("/:applicationId/messages/:messageId/read", markMessageAsRead);

export default router;
