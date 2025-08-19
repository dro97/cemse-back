import { Router } from "express";
import * as QuizController from "../controllers/QuizController";
import { authenticateToken, requireSuperAdmin, requireOrganization } from "../middleware/auth";

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);

// GET /quizzes - List all quizzes (accessible by all authenticated users)
router.get("/", QuizController.listQuizs);

// GET /quizzes/:id - Get quiz by ID (accessible by all authenticated users)
router.get("/:id", QuizController.getQuiz);

// POST /quizzes - Create new quiz (Super Admin and Organizations only)
router.post("/", requireOrganization, QuizController.createQuiz);

// PUT /quizzes/:id - Update quiz (Super Admin and Organizations only)
router.put("/:id", requireOrganization, QuizController.updateQuiz);

// DELETE /quizzes/:id - Delete quiz (Super Admin only)
router.delete("/:id", requireSuperAdmin, QuizController.deleteQuiz);

export default router;
