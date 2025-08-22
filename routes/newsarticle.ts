import express from "express";
import { listNewsArticles, getNewsArticle, createNewsArticle, updateNewsArticle, deleteNewsArticle, listPublicNewsArticles } from "../controllers/NewsArticleController";
import { authenticateToken } from "../middleware/auth";
import { uploadSingleImage, uploadNewsArticle } from "../middleware/upload";

// The uploadNewsArticle middleware now handles both JSON and multipart requests

const router = express.Router();

// Public endpoint (no authentication required)
router.get("/public", listPublicNewsArticles);

// Apply authentication to all other routes
router.use(authenticateToken);

router.get("/", listNewsArticles);
router.get("/:id", getNewsArticle);
router.post("/", uploadNewsArticle, createNewsArticle); // Handles both JSON and multipart
router.post("/json", createNewsArticle); // For application/json (legacy)
router.put("/:id", uploadNewsArticle, updateNewsArticle);
router.delete("/:id", deleteNewsArticle);

export default router;
