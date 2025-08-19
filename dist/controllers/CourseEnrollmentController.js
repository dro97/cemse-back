"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listCourseEnrollments = listCourseEnrollments;
exports.getCourseEnrollment = getCourseEnrollment;
exports.createCourseEnrollment = createCourseEnrollment;
exports.updateCourseEnrollment = updateCourseEnrollment;
exports.deleteCourseEnrollment = deleteCourseEnrollment;
const prisma_1 = require("../lib/prisma");
async function listCourseEnrollments(_req, res) {
    const items = await prisma_1.prisma.courseEnrollment.findMany();
    return res.json(items);
}
async function getCourseEnrollment(req, res) {
    const item = await prisma_1.prisma.courseEnrollment.findUnique({
        where: { id: req.params['id'] || '' }
    });
    if (!item)
        return res.status(404).json({ message: "Not found" });
    return res.json(item);
}
async function createCourseEnrollment(req, res) {
    const newItem = await prisma_1.prisma.courseEnrollment.create({
        data: req.body
    });
    return res.status(201).json(newItem);
}
async function updateCourseEnrollment(req, res) {
    const updated = await prisma_1.prisma.courseEnrollment.update({
        where: { id: req.params['id'] || '' },
        data: req.body
    });
    return res.json(updated);
}
async function deleteCourseEnrollment(req, res) {
    await prisma_1.prisma.courseEnrollment.delete({
        where: { id: req.params['id'] || '' }
    });
    return res.status(204).end();
}
//# sourceMappingURL=CourseEnrollmentController.js.map