"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const showcaseController_1 = require("../controllers/showcaseController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
router.get('/', showcaseController_1.getShowcase);
router.put('/', authMiddleware_1.authenticate, showcaseController_1.updateShowcase);
exports.default = router;
