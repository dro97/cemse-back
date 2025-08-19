import express from "express";
import { listDiscussions, getDiscussion, createDiscussion, updateDiscussion, deleteDiscussion } from "../controllers/DiscussionController";

const router = express.Router();

router.get("/", listDiscussions);
router.get("/:id", getDiscussion);
router.post("/", createDiscussion);
router.put("/:id", updateDiscussion);
router.delete("/:id", deleteDiscussion);

export default router;
