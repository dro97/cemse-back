import { Router } from "express";
import * as QuizAnswerController from "../controllers/QuizAnswerController";
import { authenticateToken, requireStudent } from "../middleware/auth";

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);

// GET /quiz-answers - List all answers (Students can see their own, Organizations can see all)
router.get("/", QuizAnswerController.listQuizAnswers);

// GET /quiz-answers/:id - Get answer by ID (Students can see their own, Organizations can see all)
router.get("/:id", QuizAnswerController.getQuizAnswer);

// POST /quiz-answers - Create new answer (Students and Organizations)
router.post("/", requireStudent, QuizAnswerController.createQuizAnswer);

// PUT /quiz-answers/:id - Update answer (Students can update their own, Organizations can update any)
router.put("/:id", QuizAnswerController.updateQuizAnswer);

// DELETE /quiz-answers/:id - Delete answer (Students can delete their own, Organizations can delete any)
router.delete("/:id", QuizAnswerController.deleteQuizAnswer);

export default router;
