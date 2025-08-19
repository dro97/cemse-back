import { Router } from "express";
import {
  listResources,
  getResource,
  createResource,
  updateResource,
  deleteResource
} from "../controllers/ResourceController";

const router = Router();

router.get("/", listResources);
router.get("/:id", getResource);
router.post("/", createResource);
router.put("/:id", updateResource);
router.delete("/:id", deleteResource);

export default router; 