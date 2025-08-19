"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listBusinessPlans = listBusinessPlans;
exports.getBusinessPlan = getBusinessPlan;
exports.createBusinessPlan = createBusinessPlan;
exports.updateBusinessPlan = updateBusinessPlan;
exports.deleteBusinessPlan = deleteBusinessPlan;
const prisma_1 = require("../lib/prisma");
async function listBusinessPlans(_req, res) {
    const items = await prisma_1.prisma.businessPlan.findMany();
    return res.json(items);
}
async function getBusinessPlan(req, res) {
    const item = await prisma_1.prisma.businessPlan.findUnique({
        where: { id: req.params["id"] || "" }
    });
    if (!item)
        return res.status(404).json({ message: "Not found" });
    return res.json(item);
}
async function createBusinessPlan(req, res) {
    const newItem = await prisma_1.prisma.businessPlan.create({
        data: req.body
    });
    return res.status(201).json(newItem);
}
async function updateBusinessPlan(req, res) {
    const updated = await prisma_1.prisma.businessPlan.update({
        where: { id: req.params["id"] || "" },
        data: req.body
    });
    return res.json(updated);
}
async function deleteBusinessPlan(req, res) {
    await prisma_1.prisma.businessPlan.delete({
        where: { id: req.params["id"] || "" }
    });
    return res.status(204).end();
}
//# sourceMappingURL=BusinessPlanController.js.map