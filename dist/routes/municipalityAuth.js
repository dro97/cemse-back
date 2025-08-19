"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const MunicipalityAuthController_1 = require("../controllers/MunicipalityAuthController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticateToken);
router.use(auth_1.requireMunicipality);
router.get("/me", MunicipalityAuthController_1.getMunicipalityProfile);
router.post("/change-password", MunicipalityAuthController_1.changeMunicipalityPassword);
exports.default = router;
//# sourceMappingURL=municipalityAuth.js.map