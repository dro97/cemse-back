"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const minioUpload_1 = require("../middleware/minioUpload");
const NewsArticleController_1 = require("../controllers/NewsArticleController");
const router = express_1.default.Router();
router.use(auth_1.authenticateToken);
router.get('/', NewsArticleController_1.listNewsArticles);
router.get('/:id', NewsArticleController_1.getNewsArticle);
router.post("/", minioUpload_1.uploadImageToMinIO, NewsArticleController_1.createNewsArticle);
router.put("/:id", minioUpload_1.uploadImageToMinIO, NewsArticleController_1.updateNewsArticle);
router.delete("/:id", NewsArticleController_1.deleteNewsArticle);
exports.default = router;
//# sourceMappingURL=newsarticle.js.map