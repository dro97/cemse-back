"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const NewsCommentController_1 = require("../controllers/NewsCommentController");
const router = express_1.default.Router();
router.get("/", NewsCommentController_1.listNewsComments);
router.get("/:id", NewsCommentController_1.getNewsComment);
router.post("/", NewsCommentController_1.createNewsComment);
router.put("/:id", NewsCommentController_1.updateNewsComment);
router.delete("/:id", NewsCommentController_1.deleteNewsComment);
exports.default = router;
//# sourceMappingURL=newscomment.js.map