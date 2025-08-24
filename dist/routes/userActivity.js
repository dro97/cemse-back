"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const UserActivityController_1 = require("../controllers/UserActivityController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.get('/:userId/dashboard', auth_1.authenticateToken, UserActivityController_1.getDashboardActivities);
exports.default = router;
//# sourceMappingURL=userActivity.js.map