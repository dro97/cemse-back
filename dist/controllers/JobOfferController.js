"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listJobOffers = listJobOffers;
exports.getJobOffer = getJobOffer;
exports.createJobOffer = createJobOffer;
exports.updateJobOffer = updateJobOffer;
exports.deleteJobOffer = deleteJobOffer;
const prisma_1 = require("../lib/prisma");
async function listJobOffers(_, res) {
    const items = await prisma_1.prisma.jobOffer.findMany();
    res.json(items);
}
async function getJobOffer(req, res) {
    const item = await prisma_1.prisma.jobOffer.findUnique({
        where: { id: req.params["id"] || "" }
    });
    if (!item)
        return res.status(404).json({ message: "Not found" });
    res.json(item);
    return;
}
async function createJobOffer(req, res) {
    const { title, description, requirements, salaryMin, salaryMax, location, contractType, workSchedule, workModality, experienceLevel, companyId, municipality } = req.body;
    if (!title || !description || !requirements || !location || !contractType || !workSchedule || !workModality || !experienceLevel || !companyId || !municipality) {
        return res.status(400).json({
            message: "title, description, requirements, location, contractType, workSchedule, workModality, experienceLevel, companyId, and municipality are required"
        });
    }
    const company = await prisma_1.prisma.company.findUnique({
        where: { id: companyId }
    });
    if (!company || !company.isActive) {
        return res.status(400).json({ message: "Invalid or inactive company" });
    }
    const newItem = await prisma_1.prisma.jobOffer.create({
        data: {
            title,
            description,
            requirements,
            salaryMin: salaryMin ? parseFloat(salaryMin) : null,
            salaryMax: salaryMax ? parseFloat(salaryMax) : null,
            location,
            contractType,
            workSchedule,
            workModality,
            experienceLevel,
            companyId,
            municipality,
            isActive: true
        }
    });
    return res.status(201).json(newItem);
}
async function updateJobOffer(req, res) {
    const updated = await prisma_1.prisma.jobOffer.update({
        where: { id: req.params["id"] || "" },
        data: req.body
    });
    res.json(updated);
}
async function deleteJobOffer(req, res) {
    await prisma_1.prisma.jobOffer.delete({
        where: { id: req.params["id"] || "" }
    });
    res.status(204).end();
}
//# sourceMappingURL=JobOfferController.js.map