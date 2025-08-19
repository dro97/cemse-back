"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const CompanyAuthController_1 = require("../controllers/CompanyAuthController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticateToken);
router.use(auth_1.requireCompany);
router.get("/me", CompanyAuthController_1.getCompanyProfile);
router.post("/change-password", CompanyAuthController_1.changeCompanyPassword);
exports.default = router;
//# sourceMappingURL=companyAuth.js.map