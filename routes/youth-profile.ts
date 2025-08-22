import { Router } from "express";
import { 
  registerYouthProfile, 
  getYouthProfile, 
  updateYouthProfile 
} from "../controllers/YouthProfileController";

const router = Router();

// POST /api/youth-profile/register - Register new youth profile
router.post("/register", registerYouthProfile);

// GET /api/youth-profile/:userId - Get youth profile by user ID
router.get("/:userId", getYouthProfile);

// PUT /api/youth-profile/:userId - Update youth profile
router.put("/:userId", updateYouthProfile);

export default router;
