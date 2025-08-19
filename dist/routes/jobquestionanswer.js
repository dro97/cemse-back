"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const JobQuestionAnswerController_1 = require("../controllers/JobQuestionAnswerController");
const router = express_1.default.Router();
router.get("/", JobQuestionAnswerController_1.listJobQuestionAnswers);
router.get("/:id", JobQuestionAnswerController_1.getJobQuestionAnswer);
router.post("/", JobQuestionAnswerController_1.createJobQuestionAnswer);
router.put("/:id", JobQuestionAnswerController_1.updateJobQuestionAnswer);
router.delete("/:id", JobQuestionAnswerController_1.deleteJobQuestionAnswer);
exports.default = router;
//# sourceMappingURL=jobquestionanswer.js.map