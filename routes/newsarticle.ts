import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { uploadImageToMinIO } from '../middleware/minioUpload';
import { createNewsArticle, listNewsArticles, getNewsArticle, updateNewsArticle, deleteNewsArticle } from '../controllers/NewsArticleController';

// The uploadImageToMinIO middleware now handles both JSON and multipart requests
const router = express.Router();

// Aplicar autenticación a todas las rutas
router.use(authenticateToken);

// Rutas públicas (requieren autenticación pero no roles específicos)
router.get('/', listNewsArticles);
router.get('/:id', getNewsArticle);

// Rutas para creadores, super admin, municipios y organizaciones
router.post("/", uploadImageToMinIO, createNewsArticle); // Handles both JSON and multipart
router.put("/:id", uploadImageToMinIO, updateNewsArticle);
router.delete("/:id", deleteNewsArticle);

export default router;
