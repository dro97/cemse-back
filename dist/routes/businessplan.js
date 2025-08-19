"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const BusinessPlanController_1 = require("../controllers/BusinessPlanController");
const router = express_1.default.Router();
router.get("/", BusinessPlanController_1.listBusinessPlans);
router.get("/:id", BusinessPlanController_1.getBusinessPlan);
router.post("/", BusinessPlanController_1.createBusinessPlan);
router.put("/:id", BusinessPlanController_1.updateBusinessPlan);
router.delete("/:id", BusinessPlanController_1.deleteBusinessPlan);
exports.default = router;
//# sourceMappingURL=businessplan.js.map