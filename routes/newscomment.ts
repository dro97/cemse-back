import express from "express";
import { listNewsComments, getNewsComment, createNewsComment, updateNewsComment, deleteNewsComment } from "../controllers/NewsCommentController";

const router = express.Router();

router.get("/", listNewsComments);
router.get("/:id", getNewsComment);
router.post("/", createNewsComment);
router.put("/:id", updateNewsComment);
router.delete("/:id", deleteNewsComment);

export default router;
