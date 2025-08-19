"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const EntrepreneurshipController_1 = require("../controllers/EntrepreneurshipController");
const router = express_1.default.Router();
router.get("/", EntrepreneurshipController_1.listEntrepreneurships);
router.get("/:id", EntrepreneurshipController_1.getEntrepreneurship);
router.post("/", EntrepreneurshipController_1.createEntrepreneurship);
router.put("/:id", EntrepreneurshipController_1.updateEntrepreneurship);
router.delete("/:id", EntrepreneurshipController_1.deleteEntrepreneurship);
exports.default = router;
//# sourceMappingURL=entrepreneurship.js.map