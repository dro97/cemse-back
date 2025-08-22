"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ResourceController_1 = require("../controllers/ResourceController");
const auth_1 = require("../middleware/auth");
const minioUpload_1 = require("../middleware/minioUpload");
const router = (0, express_1.Router)();
router.get("/", ResourceController_1.listResources);
router.get("/:id", ResourceController_1.getResource);
router.get("/municipality/:municipalityId", ResourceController_1.getMunicipalityResources);
router.get("/municipality/:municipalityName/search", ResourceController_1.searchMunicipalityResources);
router.post("/", auth_1.authenticateToken, auth_1.requireOrganization, minioUpload_1.uploadResourceToMinIO, ResourceController_1.createResource);
router.put("/:id", auth_1.authenticateToken, auth_1.requireOrganization, minioUpload_1.uploadResourceToMinIO, ResourceController_1.updateResource);
router.delete("/:id", auth_1.authenticateToken, auth_1.requireSuperAdmin, ResourceController_1.deleteResource);
exports.default = router;
//# sourceMappingURL=resource.js.map