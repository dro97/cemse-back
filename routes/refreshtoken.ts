import { Router } from "express";
import {
  listRefreshTokens,
  getRefreshToken,
  createRefreshToken,
  updateRefreshToken,
  deleteRefreshToken
} from "../controllers/RefreshTokenController";

const router = Router();

router.get("/", listRefreshTokens);
router.get("/:id", getRefreshToken);
router.post("/", createRefreshToken);
router.put("/:id", updateRefreshToken);
router.delete("/:id", deleteRefreshToken);

export default router; 