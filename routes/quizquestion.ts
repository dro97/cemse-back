import { Router } from "express";
import * as QuizQuestionController from "../controllers/QuizQuestionController";
import { authenticateToken, requireSuperAdmin, requireOrganization } from "../middleware/auth";

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);

// GET /quiz-questions - List all questions (accessible by all authenticated users)
router.get("/", QuizQuestionController.listQuizQuestions);

// GET /quiz-questions/:id - Get question by ID (accessible by all authenticated users)
router.get("/:id", QuizQuestionController.getQuizQuestion);

// POST /quiz-questions - Create new question (Super Admin and Organizations only)
router.post("/", requireOrganization, QuizQuestionController.createQuizQuestion);

// PUT /quiz-questions/:id - Update question (Super Admin and Organizations only)
router.put("/:id", requireOrganization, QuizQuestionController.updateQuizQuestion);

// DELETE /quiz-questions/:id - Delete question (Super Admin only)
router.delete("/:id", requireSuperAdmin, QuizQuestionController.deleteQuizQuestion);

export default router;
