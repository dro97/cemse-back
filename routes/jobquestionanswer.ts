import express from "express";
import { listJobQuestionAnswers, getJobQuestionAnswer, createJobQuestionAnswer, updateJobQuestionAnswer, deleteJobQuestionAnswer } from "../controllers/JobQuestionAnswerController";

const router = express.Router();

router.get("/", listJobQuestionAnswers);
router.get("/:id", getJobQuestionAnswer);
router.post("/", createJobQuestionAnswer);
router.put("/:id", updateJobQuestionAnswer);
router.delete("/:id", deleteJobQuestionAnswer);

export default router;
