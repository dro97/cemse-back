"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listQuizAttempts = listQuizAttempts;
exports.getQuizAttempt = getQuizAttempt;
exports.createQuizAttempt = createQuizAttempt;
exports.updateQuizAttempt = updateQuizAttempt;
exports.deleteQuizAttempt = deleteQuizAttempt;
exports.completeQuiz = completeQuiz;
const prisma_1 = require("../lib/prisma");
async function listQuizAttempts(_req, res) {
    const items = await prisma_1.prisma.quizAttempt.findMany();
    return res.json(items);
}
async function getQuizAttempt(req, res) {
    const item = await prisma_1.prisma.quizAttempt.findUnique({
        where: { id: req.params['id'] || '' }
    });
    if (!item)
        return res.status(404).json({ message: "Not found" });
    return res.json(item);
}
async function createQuizAttempt(req, res) {
    const newItem = await prisma_1.prisma.quizAttempt.create({
        data: req.body
    });
    return res.status(201).json(newItem);
}
async function updateQuizAttempt(req, res) {
    const updated = await prisma_1.prisma.quizAttempt.update({
        where: { id: req.params['id'] || '' },
        data: req.body
    });
    return res.json(updated);
}
async function deleteQuizAttempt(req, res) {
    await prisma_1.prisma.quizAttempt.delete({
        where: { id: req.params['id'] || '' }
    });
    return res.status(204).end();
}
async function completeQuiz(req, res) {
    try {
        const { quizId, enrollmentId, answers } = req.body;
        const studentId = req.user?.id;
        if (!studentId || !quizId || !enrollmentId || !answers) {
            return res.status(400).json({
                message: "Missing required fields: quizId, enrollmentId, answers, and user must be authenticated"
            });
        }
        const quiz = await prisma_1.prisma.quiz.findUnique({
            where: { id: quizId },
            include: {
                questions: {
                    orderBy: { orderIndex: 'asc' }
                }
            }
        });
        if (!quiz) {
            return res.status(404).json({ message: "Quiz not found" });
        }
        const quizAttempt = await prisma_1.prisma.quizAttempt.create({
            data: {
                quizId,
                enrollmentId,
                studentId,
                startedAt: new Date(),
                completedAt: new Date(),
                timeSpent: 0,
                score: 0,
                passed: false
            }
        });
        let correctAnswers = 0;
        const totalQuestions = quiz.questions.length;
        for (const answer of answers) {
            const question = quiz.questions.find(q => q.id === answer.questionId);
            if (question) {
                const isCorrect = question.correctAnswer === answer.answer;
                await prisma_1.prisma.quizAnswer.create({
                    data: {
                        attemptId: quizAttempt.id,
                        questionId: answer.questionId,
                        answer: answer.answer,
                        isCorrect,
                        timeSpent: answer.timeSpent || 0
                    }
                });
                if (isCorrect) {
                    correctAnswers++;
                }
            }
        }
        const score = Math.round((correctAnswers / totalQuestions) * 100);
        const passed = score >= quiz.passingScore;
        const updatedAttempt = await prisma_1.prisma.quizAttempt.update({
            where: { id: quizAttempt.id },
            data: {
                score,
                passed,
                completedAt: new Date()
            },
            include: {
                answers: {
                    include: {
                        question: true
                    }
                },
                quiz: {
                    include: {
                        questions: true
                    }
                }
            }
        });
        return res.json({
            message: "Quiz completed successfully",
            attempt: updatedAttempt,
            score,
            passed,
            correctAnswers,
            totalQuestions,
            passingScore: quiz.passingScore
        });
    }
    catch (error) {
        console.error("Error completing quiz:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}
//# sourceMappingURL=QuizAttemptController.js.map