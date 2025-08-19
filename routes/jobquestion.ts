import express from "express";
import { listJobQuestions, getJobQuestion, createJobQuestion, updateJobQuestion, deleteJobQuestion } from "../controllers/JobQuestionController";

const router = express.Router();

router.get("/", listJobQuestions);
router.get("/:id", getJobQuestion);
router.post("/", createJobQuestion);
router.put("/:id", updateJobQuestion);
router.delete("/:id", deleteJobQuestion);

export default router;
