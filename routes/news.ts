import express from "express";
import * as NewsArticleController from "../controllers/NewsArticleController";
import { optionalAuth } from "../middleware/auth";

const router = express.Router();

// GET /news - List all published news articles (accessible by all users)
router.get("/", optionalAuth, NewsArticleController.listNewsArticles);

// GET /news/:id - Get news article by ID (accessible by all users)
router.get("/:id", optionalAuth, NewsArticleController.getNewsArticle);

export default router; 