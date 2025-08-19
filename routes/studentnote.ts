import { Router } from "express";
import * as StudentNoteController from "../controllers/StudentNoteController";
import { authenticateToken, requireStudent } from "../middleware/auth";

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);

// GET /student-notes - List all notes (Students can see their own, Organizations can see all)
router.get("/", StudentNoteController.listStudentNotes);

// GET /student-notes/:id - Get note by ID (Students can see their own, Organizations can see all)
router.get("/:id", StudentNoteController.getStudentNote);

// POST /student-notes - Create new note (Students and Organizations)
router.post("/", requireStudent, StudentNoteController.createStudentNote);

// PUT /student-notes/:id - Update note (Students can update their own, Organizations can update any)
router.put("/:id", StudentNoteController.updateStudentNote);

// DELETE /student-notes/:id - Delete note (Students can delete their own, Organizations can delete any)
router.delete("/:id", StudentNoteController.deleteStudentNote);

export default router;
