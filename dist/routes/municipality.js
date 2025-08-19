"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const MunicipalityController_1 = require("../controllers/MunicipalityController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticateToken);
router.get("/", MunicipalityController_1.listMunicipalities);
router.get("/:id", MunicipalityController_1.getMunicipality);
router.post("/", MunicipalityController_1.createMunicipality);
router.put("/:id", MunicipalityController_1.updateMunicipality);
router.delete("/:id", MunicipalityController_1.deleteMunicipality);
exports.default = router;
//# sourceMappingURL=municipality.js.map