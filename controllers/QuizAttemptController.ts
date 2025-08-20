import { prisma } from "../lib/prisma";
import { Request, Response } from "express";

export async function listQuizAttempts(_req: Request, res: Response) {
  const items = await prisma.quizAttempt.findMany();
  return res.json(items);
}

export async function getQuizAttempt(req: Request, res: Response) {
  const item = await prisma.quizAttempt.findUnique({
    where: { id: req.params['id'] || '' }
  });
  if (!item) return res.status(404).json({ message: "Not found" });
  return res.json(item);
}

export async function createQuizAttempt(req: Request, res: Response) {
  const newItem = await prisma.quizAttempt.create({
    data: req.body
  });
  return res.status(201).json(newItem);
}

export async function updateQuizAttempt(req: Request, res: Response) {
  const updated = await prisma.quizAttempt.update({
    where: { id: req.params['id'] || '' },
    data: req.body
  });
  return res.json(updated);
}

export async function deleteQuizAttempt(req: Request, res: Response) {
  await prisma.quizAttempt.delete({
    where: { id: req.params['id'] || '' }
  });
  return res.status(204).end();
}

// Endpoint para completar un quiz
export async function completeQuiz(req: Request, res: Response) {
  try {
    const { quizId, enrollmentId, answers } = req.body;
    const studentId = (req as any).user?.id;

    if (!studentId || !quizId || !enrollmentId || !answers) {
      return res.status(400).json({
        message: "Missing required fields: quizId, enrollmentId, answers, and user must be authenticated"
      });
    }

    // 1. Obtener el quiz y sus preguntas
    const quiz = await prisma.quiz.findUnique({
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

    // 2. Crear el intento de quiz
    const quizAttempt = await prisma.quizAttempt.create({
      data: {
        quizId,
        enrollmentId,
        studentId,
        startedAt: new Date(),
        completedAt: new Date(),
        timeSpent: 0, // Puedes calcular esto si tienes el tiempo de inicio
        score: 0,
        passed: false
      }
    });

    // 3. Procesar las respuestas y calcular el score
    let correctAnswers = 0;
    const totalQuestions = quiz.questions.length;

    for (const answer of answers) {
      const question = quiz.questions.find(q => q.id === answer.questionId);
      if (question) {
        const isCorrect = question.correctAnswer === answer.answer;
        
        // Crear la respuesta
        await prisma.quizAnswer.create({
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

    // 4. Calcular el score y determinar si pasó
    const score = Math.round((correctAnswers / totalQuestions) * 100);
    const passed = score >= quiz.passingScore;

    // 5. Actualizar el intento con el resultado final
    const updatedAttempt = await prisma.quizAttempt.update({
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

  } catch (error: any) {
    console.error("Error completing quiz:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
}
