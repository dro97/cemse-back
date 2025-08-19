import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import * as MessageController from "../controllers/MessageController";

const router = Router();

// Aplicar autenticación a todas las rutas
router.use(authenticateToken);

// Obtener conversaciones del usuario
router.get("/conversations", MessageController.getConversations);

// Obtener mensajes de una conversación específica
router.get("/conversation/:contactId", MessageController.getConversationMessages);

// Enviar mensaje
router.post("/send", MessageController.sendMessage);

// Marcar mensaje como leído
router.put("/:messageId/read", MessageController.markMessageAsRead);

// Obtener estadísticas de mensajería
router.get("/stats", MessageController.getMessagingStats);

// Eliminar mensaje
router.delete("/:messageId", MessageController.deleteMessage);

export default router;
