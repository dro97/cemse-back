import { prisma } from "../lib/prisma";
import { Request, Response } from "express";

export async function listQuizAnswers(_req: Request, res: Response) {
  const items = await prisma.quizAnswer.findMany();
  return res.json(items);
}

export async function getQuizAnswer(req: Request, res: Response) {
  const item = await prisma.quizAnswer.findUnique({
    where: { id: req.params['id'] || '' }
  });
  if (!item) return res.status(404).json({ message: "Not found" });
  return res.json(item);
}

export async function createQuizAnswer(req: Request, res: Response) {
  const newItem = await prisma.quizAnswer.create({
    data: req.body
  });
  return res.status(201).json(newItem);
}

export async function updateQuizAnswer(req: Request, res: Response) {
  const updated = await prisma.quizAnswer.update({
    where: { id: req.params['id'] || '' },
    data: req.body
  });
  return res.json(updated);
}

export async function deleteQuizAnswer(req: Request, res: Response) {
  await prisma.quizAnswer.delete({
    where: { id: req.params['id'] || '' }
  });
  return res.status(204).end();
}
