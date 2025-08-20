"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const InstitutionController_1 = require("../controllers/InstitutionController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get("/public", InstitutionController_1.listPublicInstitutions);
router.use(auth_1.authenticateToken);
router.get("/", InstitutionController_1.listInstitutions);
router.get("/:id", InstitutionController_1.getInstitution);
router.post("/", InstitutionController_1.createInstitution);
router.put("/:id", InstitutionController_1.updateInstitution);
router.delete("/:id", InstitutionController_1.deleteInstitution);
exports.default = router;
//# sourceMappingURL=institution.js.map