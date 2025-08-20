"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const BusinessPlanController_1 = require("../controllers/BusinessPlanController");
const auth_1 = require("../middleware/auth");
const client_1 = require("@prisma/client");
const router = express_1.default.Router();
router.use(auth_1.authenticateToken);
router.get("/", (0, auth_1.requireRole)([client_1.UserRole.YOUTH, client_1.UserRole.ADOLESCENTS]), BusinessPlanController_1.getLatestBusinessPlan);
router.get("/all", (0, auth_1.requireRole)([client_1.UserRole.YOUTH, client_1.UserRole.ADOLESCENTS]), BusinessPlanController_1.listAllBusinessPlans);
router.get("/entrepreneurship/:entrepreneurshipId", (0, auth_1.requireRole)([client_1.UserRole.YOUTH, client_1.UserRole.ADOLESCENTS]), BusinessPlanController_1.getBusinessPlanByEntrepreneurship);
router.get("/:id", (0, auth_1.requireRole)([client_1.UserRole.YOUTH, client_1.UserRole.ADOLESCENTS]), BusinessPlanController_1.getBusinessPlan);
router.post("/", (0, auth_1.requireRole)([client_1.UserRole.YOUTH, client_1.UserRole.ADOLESCENTS]), BusinessPlanController_1.createBusinessPlan);
router.post("/simulator", (0, auth_1.requireRole)([client_1.UserRole.YOUTH, client_1.UserRole.ADOLESCENTS]), BusinessPlanController_1.saveBusinessPlanSimulator);
router.put("/:id", (0, auth_1.requireRole)([client_1.UserRole.YOUTH, client_1.UserRole.ADOLESCENTS]), BusinessPlanController_1.updateBusinessPlan);
router.delete("/:id", (0, auth_1.requireRole)([client_1.UserRole.YOUTH, client_1.UserRole.ADOLESCENTS]), BusinessPlanController_1.deleteBusinessPlan);
exports.default = router;
//# sourceMappingURL=businessplan.js.map