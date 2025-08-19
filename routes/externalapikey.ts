import { Router } from "express";
import {
  createExternalApiKey,
  listExternalApiKeys,
  revokeExternalApiKey
} from "../controllers/ExternalApiKeyController";

const router = Router();

router.post("/", ...createExternalApiKey);
router.get("/", ...listExternalApiKeys);
router.patch("/:id/revoke", ...revokeExternalApiKey);

export default router; 