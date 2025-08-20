import { prisma } from "../lib/prisma";
import { Request, Response } from "express";

export async function listQuizQuestions(_req: Request, res: Response) {
  const items = await prisma.quizQuestion.findMany();
  return res.json(items);
}

export async function getQuizQuestion(req: Request, res: Response): Promise<Response> {
  const item = await prisma.quizQuestion.findUnique({
    where: { id: req.params['id'] || '' }
  });
  if (!item) return res.status(404).json({ message: "Not found" });
  return res.json(item);
}

export async function createQuizQuestion(req: Request, res: Response): Promise<Response> {
  const newItem = await prisma.quizQuestion.create({
    data: req.body
  });
  return res.status(201).json(newItem);
}

export async function updateQuizQuestion(req: Request, res: Response): Promise<Response> {
  const updated = await prisma.quizQuestion.update({
    where: { id: req.params['id'] || '' },
    data: req.body
  });
  return res.json(updated);
}

export async function deleteQuizQuestion(req: Request, res: Response): Promise<Response> {
  await prisma.quizQuestion.delete({
    where: { id: req.params['id'] || '' }
  });
  return res.status(204).end();
}
