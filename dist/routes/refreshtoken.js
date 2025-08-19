"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const RefreshTokenController_1 = require("../controllers/RefreshTokenController");
const router = (0, express_1.Router)();
router.get("/", RefreshTokenController_1.listRefreshTokens);
router.get("/:id", RefreshTokenController_1.getRefreshToken);
router.post("/", RefreshTokenController_1.createRefreshToken);
router.put("/:id", RefreshTokenController_1.updateRefreshToken);
router.delete("/:id", RefreshTokenController_1.deleteRefreshToken);
exports.default = router;
//# sourceMappingURL=refreshtoken.js.map