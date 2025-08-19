import express from "express";
import { 
  listNewsArticles, 
  getNewsArticle, 
  createNewsArticle, 
  updateNewsArticle, 
  deleteNewsArticle 
} from "../controllers/NewsArticleController";
import { authenticateToken } from "../middleware/auth";
import { UserRole } from "@prisma/client";

const router = express.Router();

// Apply authentication middleware to all admin routes
router.use(authenticateToken);

// Custom middleware to allow SuperAdmin, Municipal Governments, Municipalities, and Youth
const requireAdminOrMunicipality = (req: any, res: any, next: any) => {
  const user = req.user;
  
  if (!user) {
    return res.status(401).json({ message: "Authentication required" });
  }
  
  console.log("Admin access check - User:", {
    id: user.id,
    username: user.username,
    role: user.role,
    type: user.type
  });
  
  // Allow SuperAdmin
  if (user.role === 'SUPERADMIN' || user.role === UserRole.SUPERADMIN) {
    console.log("Access granted: SuperAdmin");
    return next();
  }
  
  // Allow Municipal Governments
  if (user.role === 'MUNICIPAL_GOVERNMENTS' || user.role === UserRole.MUNICIPAL_GOVERNMENTS) {
    console.log("Access granted: Municipal Governments");
    return next();
  }
  
  // Allow Municipalities (type 'municipality')
  if (user.type === 'municipality') {
    console.log("Access granted: Municipality");
    return next();
  }
  
  // Allow Youth to view news (read-only access)
  if (user.role === 'YOUTH' || user.role === UserRole.YOUTH) {
    console.log("Access granted: Youth (read-only)");
    return next();
  }
  
  // Allow Adolescents to view news (read-only access)
  if (user.role === 'ADOLESCENTS' || user.role === UserRole.ADOLESCENTS) {
    console.log("Access granted: Adolescents (read-only)");
    return next();
  }
  
  console.log("Access denied - User role:", user.role, "User type:", user.type);
  return res.status(403).json({ 
    message: "Access denied. Only SuperAdmin, Municipal Governments, Municipalities, Youth, and Adolescents can access admin features",
    debug: {
      userRole: user.role,
      userType: user.type,
      userId: user.id,
      username: user.username
    }
  });
};

router.use(requireAdminOrMunicipality);

// News management routes
router.get("/news", listNewsArticles);
router.get("/news/:id", getNewsArticle);
router.post("/news", createNewsArticle);
router.put("/news/:id", updateNewsArticle);
router.delete("/news/:id", deleteNewsArticle);

export default router; 