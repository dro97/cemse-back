"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const JobQuestionController_1 = require("../controllers/JobQuestionController");
const router = express_1.default.Router();
router.get("/", JobQuestionController_1.listJobQuestions);
router.get("/:id", JobQuestionController_1.getJobQuestion);
router.post("/", JobQuestionController_1.createJobQuestion);
router.put("/:id", JobQuestionController_1.updateJobQuestion);
router.delete("/:id", JobQuestionController_1.deleteJobQuestion);
exports.default = router;
//# sourceMappingURL=jobquestion.js.map