"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const DiscussionController_1 = require("../controllers/DiscussionController");
const router = express_1.default.Router();
router.get("/", DiscussionController_1.listDiscussions);
router.get("/:id", DiscussionController_1.getDiscussion);
router.post("/", DiscussionController_1.createDiscussion);
router.put("/:id", DiscussionController_1.updateDiscussion);
router.delete("/:id", DiscussionController_1.deleteDiscussion);
exports.default = router;
//# sourceMappingURL=discussion.js.map