"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const server_1 = require("../server");
const router = (0, express_1.Router)();
router.get("/status", (_req, res) => {
    const connections = server_1.io.engine.clientsCount;
    res.json({
        status: "running",
        connections,
        events: [
            "profile:created",
            "profile:updated",
            "profile:deleted",
            "course:created",
            "course:updated",
            "course:deleted"
        ]
    });
});
router.post("/emit", (req, res) => {
    const { event, data } = req.body;
    if (!event) {
        return res.status(400).json({ message: "Event name is required" });
    }
    server_1.io.emit(event, data || {});
    return res.json({ message: `Event '${event}' emitted successfully` });
});
exports.default = router;
//# sourceMappingURL=socket.js.map