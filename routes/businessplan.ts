import express from "express";
import { getLatestBusinessPlan, listAllBusinessPlans, getBusinessPlan, createBusinessPlan, updateBusinessPlan, deleteBusinessPlan, getBusinessPlanByEntrepreneurship, saveBusinessPlanSimulator } from "../controllers/BusinessPlanController";
import { authenticateToken, requireRole } from "../middleware/auth";
import { UserRole } from "@prisma/client";

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Only YOUTH and ADOLESCENTS can access business plans
router.get("/", requireRole([UserRole.YOUTH, UserRole.ADOLESCENTS]), getLatestBusinessPlan);
router.get("/all", requireRole([UserRole.YOUTH, UserRole.ADOLESCENTS]), listAllBusinessPlans);
router.get("/entrepreneurship/:entrepreneurshipId", requireRole([UserRole.YOUTH, UserRole.ADOLESCENTS]), getBusinessPlanByEntrepreneurship);
router.get("/:id", requireRole([UserRole.YOUTH, UserRole.ADOLESCENTS]), getBusinessPlan);
router.post("/", requireRole([UserRole.YOUTH, UserRole.ADOLESCENTS]), createBusinessPlan);
router.post("/simulator", requireRole([UserRole.YOUTH, UserRole.ADOLESCENTS]), saveBusinessPlanSimulator);
router.put("/:id", requireRole([UserRole.YOUTH, UserRole.ADOLESCENTS]), updateBusinessPlan);
router.delete("/:id", requireRole([UserRole.YOUTH, UserRole.ADOLESCENTS]), deleteBusinessPlan);

export default router;
