import express from "express";
import { listNewsArticles, getNewsArticle, createNewsArticle, updateNewsArticle, deleteNewsArticle, listPublicNewsArticles } from "../controllers/NewsArticleController";
import { authenticateToken } from "../middleware/auth";
import { uploadSingleImage } from "../middleware/upload";

const router = express.Router();

// Public endpoint (no authentication required)
router.get("/public", listPublicNewsArticles);

// Apply authentication to all other routes
router.use(authenticateToken);

router.get("/", listNewsArticles);
router.get("/:id", getNewsArticle);
router.post("/", uploadSingleImage, createNewsArticle);
router.post("/json", createNewsArticle); // Endpoint for JSON data without file upload
router.put("/:id", uploadSingleImage, updateNewsArticle);
router.delete("/:id", deleteNewsArticle);

export default router;
