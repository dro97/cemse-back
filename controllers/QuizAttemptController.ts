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
