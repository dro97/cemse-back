"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ResourceController_1 = require("../controllers/ResourceController");
const router = (0, express_1.Router)();
router.get("/", ResourceController_1.listResources);
router.get("/:id", ResourceController_1.getResource);
router.post("/", ResourceController_1.createResource);
router.put("/:id", ResourceController_1.updateResource);
router.delete("/:id", ResourceController_1.deleteResource);
exports.default = router;
//# sourceMappingURL=resource.js.map