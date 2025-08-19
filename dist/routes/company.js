"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const CompanyController_1 = require("../controllers/CompanyController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticateToken);
router.get("/", CompanyController_1.listCompanies);
router.get("/search", CompanyController_1.searchCompanies);
router.get("/stats", CompanyController_1.getCompanyStats);
router.get("/test-auth", CompanyController_1.testAuth);
router.get("/:id", CompanyController_1.getCompany);
router.post("/", CompanyController_1.createCompany);
router.put("/:id", CompanyController_1.updateCompany);
router.delete("/:id", CompanyController_1.deleteCompany);
exports.default = router;
//# sourceMappingURL=company.js.map