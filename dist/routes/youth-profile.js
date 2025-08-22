"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const YouthProfileController_1 = require("../controllers/YouthProfileController");
const router = (0, express_1.Router)();
router.post("/register", YouthProfileController_1.registerYouthProfile);
router.get("/:userId", YouthProfileController_1.getYouthProfile);
router.put("/:userId", YouthProfileController_1.updateYouthProfile);
exports.default = router;
//# sourceMappingURL=youth-profile.js.map