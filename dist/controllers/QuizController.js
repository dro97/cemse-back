"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listQuizs = listQuizs;
exports.getQuiz = getQuiz;
exports.createQuiz = createQuiz;
exports.updateQuiz = updateQuiz;
exports.deleteQuiz = deleteQuiz;
const prisma_1 = require("../lib/prisma");
const server_1 = require("../server");
async function listQuizs(_req, res) {
    const items = await prisma_1.prisma.quiz.findMany();
    return res.json(items);
}
async function getQuiz(req, res) {
    const item = await prisma_1.prisma.quiz.findUnique({
        where: { id: req.params['id'] || "" }
    });
    if (!item)
        return res.status(404).json({ message: "Not found" });
    return res.json(item);
}
async function createQuiz(req, res) {
    try {
        console.log('🔍 DEBUG - createQuiz llamado');
        console.log('🔍 DEBUG - req.body:', JSON.stringify(req.body, null, 2));
        console.log('🔍 DEBUG - req.headers:', JSON.stringify(req.headers, null, 2));
        console.log('🔍 DEBUG - req.method:', req.method);
        console.log('🔍 DEBUG - req.url:', req.url);
        if (!req.body || !req.body.title) {
            console.log('❌ DEBUG - req.body es undefined o no tiene title');
            console.log('❌ DEBUG - req.body type:', typeof req.body);
            console.log('❌ DEBUG - req.body keys:', req.body ? Object.keys(req.body) : 'undefined');
            return res.status(400).json({
                error: 'Datos inválidos',
                message: 'El título del quiz es requerido',
                debug: {
                    bodyExists: !!req.body,
                    bodyType: typeof req.body,
                    bodyKeys: req.body ? Object.keys(req.body) : 'undefined',
                    hasTitle: req.body ? !!req.body.title : false
                }
            });
        }
        const { courseId, lessonId, title, description, timeLimit, passingScore = 70, showCorrectAnswers = false, isActive = true } = req.body;
        if (!courseId && !lessonId) {
            return res.status(400).json({
                error: 'Datos inválidos',
                message: 'Debe especificar courseId o lessonId'
            });
        }
        const newItem = await prisma_1.prisma.quiz.create({
            data: {
                courseId: courseId || null,
                lessonId: lessonId || null,
                title,
                description: description || null,
                timeLimit: timeLimit ? parseInt(timeLimit) : null,
                passingScore: parseInt(passingScore),
                showCorrectAnswers: showCorrectAnswers === "true" || showCorrectAnswers === true,
                isActive: isActive === "true" || isActive === true
            }
        });
        server_1.io.emit("quiz:created", newItem);
        return res.status(201).json(newItem);
    }
    catch (error) {
        console.error('Error creando quiz:', error);
        return res.status(500).json({
            error: 'Error interno del servidor',
            message: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
}
async function updateQuiz(req, res) {
    try {
        const quizId = req.params['id'];
        if (!quizId) {
            return res.status(400).json({
                error: 'ID requerido',
                message: 'El ID del quiz es requerido'
            });
        }
        if (!req.body) {
            return res.status(400).json({
                error: 'Datos inválidos',
                message: 'No se proporcionaron datos para actualizar'
            });
        }
        const { courseId, lessonId, title, description, timeLimit, passingScore, showCorrectAnswers, isActive } = req.body;
        const updateData = {};
        if (title !== undefined)
            updateData.title = title;
        if (description !== undefined)
            updateData.description = description;
        if (courseId !== undefined)
            updateData.courseId = courseId || null;
        if (lessonId !== undefined)
            updateData.lessonId = lessonId || null;
        if (timeLimit !== undefined)
            updateData.timeLimit = timeLimit ? parseInt(timeLimit) : null;
        if (passingScore !== undefined)
            updateData.passingScore = parseInt(passingScore);
        if (showCorrectAnswers !== undefined)
            updateData.showCorrectAnswers = showCorrectAnswers === "true" || showCorrectAnswers === true;
        if (isActive !== undefined)
            updateData.active = isActive === "true" || isActive === true;
        const updated = await prisma_1.prisma.quiz.update({
            where: { id: quizId },
            data: updateData
        });
        server_1.io.emit("quiz:updated", updated);
        return res.json(updated);
    }
    catch (error) {
        console.error('Error actualizando quiz:', error);
        return res.status(500).json({
            error: 'Error interno del servidor',
            message: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
}
async function deleteQuiz(req, res) {
    await prisma_1.prisma.quiz.delete({
        where: { id: req.params['id'] || "" }
    });
    server_1.io.emit("quiz:deleted", { id: req.params['id'] });
    return res.status(204).end();
}
//# sourceMappingURL=QuizController.js.map