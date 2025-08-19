import { Router } from "express";
import * as QuizAttemptController from "../controllers/QuizAttemptController";
import { authenticateToken, requireStudent } from "../middleware/auth";

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);

// GET /quiz-attempts - List all attempts (Students can see their own, Organizations can see all)
router.get("/", QuizAttemptController.listQuizAttempts);

// GET /quiz-attempts/:id - Get attempt by ID (Students can see their own, Organizations can see all)
router.get("/:id", QuizAttemptController.getQuizAttempt);

// POST /quiz-attempts - Create new attempt (Students and Organizations)
router.post("/", requireStudent, QuizAttemptController.createQuizAttempt);

// PUT /quiz-attempts/:id - Update attempt (Students can update their own, Organizations can update any)
router.put("/:id", QuizAttemptController.updateQuizAttempt);

// DELETE /quiz-attempts/:id - Delete attempt (Students can delete their own, Organizations can delete any)
router.delete("/:id", QuizAttemptController.deleteQuizAttempt);

export default router;
