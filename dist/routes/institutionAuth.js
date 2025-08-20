"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const InstitutionAuthController_1 = require("../controllers/InstitutionAuthController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.post("/login", InstitutionAuthController_1.institutionLogin);
router.use(auth_1.authenticateToken);
router.get("/me", InstitutionAuthController_1.getInstitutionProfile);
router.post("/change-password", InstitutionAuthController_1.changeInstitutionPassword);
exports.default = router;
//# sourceMappingURL=institutionAuth.js.map