"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ExternalApiKeyController_1 = require("../controllers/ExternalApiKeyController");
const router = (0, express_1.Router)();
router.post("/", ...ExternalApiKeyController_1.createExternalApiKey);
router.get("/", ...ExternalApiKeyController_1.listExternalApiKeys);
router.patch("/:id/revoke", ...ExternalApiKeyController_1.revokeExternalApiKey);
exports.default = router;
//# sourceMappingURL=externalapikey.js.map