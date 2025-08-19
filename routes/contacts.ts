import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import * as ContactController from "../controllers/ContactController";

const router = Router();

// Aplicar autenticación a todas las rutas
router.use(authenticateToken);

// Buscar jóvenes para agregar a la red
router.get("/search", ContactController.searchYouthUsers);

// Enviar solicitud de contacto
router.post("/request", ContactController.sendContactRequest);

// Obtener solicitudes de contacto recibidas
router.get("/requests/received", ContactController.getReceivedContactRequests);

// Aceptar solicitud de contacto
router.put("/requests/:contactId/accept", ContactController.acceptContactRequest);

// Rechazar solicitud de contacto
router.put("/requests/:contactId/reject", ContactController.rejectContactRequest);

// Obtener lista de contactos (conexiones aceptadas)
router.get("/", ContactController.getContacts);

// Eliminar contacto
router.delete("/:contactId", ContactController.removeContact);

// Obtener estadísticas de la red
router.get("/stats", ContactController.getNetworkStats);

export default router;
