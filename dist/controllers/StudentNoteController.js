"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listStudentNotes = listStudentNotes;
exports.getStudentNote = getStudentNote;
exports.createStudentNote = createStudentNote;
exports.updateStudentNote = updateStudentNote;
exports.deleteStudentNote = deleteStudentNote;
const prisma_1 = require("../lib/prisma");
async function listStudentNotes(_req, res) {
    const items = await prisma_1.prisma.studentNote.findMany();
    return res.json(items);
}
async function getStudentNote(req, res) {
    const item = await prisma_1.prisma.studentNote.findUnique({
        where: { id: req.params['id'] || '' }
    });
    if (!item)
        return res.status(404).json({ message: "Not found" });
    return res.json(item);
}
async function createStudentNote(req, res) {
    const newItem = await prisma_1.prisma.studentNote.create({
        data: req.body
    });
    return res.status(201).json(newItem);
}
async function updateStudentNote(req, res) {
    const updated = await prisma_1.prisma.studentNote.update({
        where: { id: req.params['id'] || '' },
        data: req.body
    });
    return res.json(updated);
}
async function deleteStudentNote(req, res) {
    await prisma_1.prisma.studentNote.delete({
        where: { id: req.params['id'] || '' }
    });
    return res.status(204).end();
}
//# sourceMappingURL=StudentNoteController.js.map