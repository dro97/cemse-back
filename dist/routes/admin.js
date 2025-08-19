"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const NewsArticleController_1 = require("../controllers/NewsArticleController");
const auth_1 = require("../middleware/auth");
const client_1 = require("@prisma/client");
const router = express_1.default.Router();
router.use(auth_1.authenticateToken);
const requireAdminOrMunicipality = (req, res, next) => {
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
    if (user.role === 'SUPERADMIN' || user.role === client_1.UserRole.SUPERADMIN) {
        console.log("Access granted: SuperAdmin");
        return next();
    }
    if (user.role === 'MUNICIPAL_GOVERNMENTS' || user.role === client_1.UserRole.MUNICIPAL_GOVERNMENTS) {
        console.log("Access granted: Municipal Governments");
        return next();
    }
    if (user.type === 'municipality') {
        console.log("Access granted: Municipality");
        return next();
    }
    if (user.role === 'YOUTH' || user.role === client_1.UserRole.YOUTH) {
        console.log("Access granted: Youth (read-only)");
        return next();
    }
    if (user.role === 'ADOLESCENTS' || user.role === client_1.UserRole.ADOLESCENTS) {
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
router.get("/news", NewsArticleController_1.listNewsArticles);
router.get("/news/:id", NewsArticleController_1.getNewsArticle);
router.post("/news", NewsArticleController_1.createNewsArticle);
router.put("/news/:id", NewsArticleController_1.updateNewsArticle);
router.delete("/news/:id", NewsArticleController_1.deleteNewsArticle);
exports.default = router;
//# sourceMappingURL=admin.js.map