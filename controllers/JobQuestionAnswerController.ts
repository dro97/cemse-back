import { prisma } from "../lib/prisma";
import { Request, Response } from "express";

export async function listJobQuestionAnswers(_req: Request, res: Response) {
  const items = await prisma.jobQuestionAnswer.findMany();
  return res.json(items);
}

export async function getJobQuestionAnswer(req: Request, res: Response) {
  const item = await prisma.jobQuestionAnswer.findUnique({
    where: { id: req.params['id'] || '' }
  });
  if (!item) return res.status(404).json({ message: "Not found" });
  return res.json(item);
}

export async function createJobQuestionAnswer(req: Request, res: Response) {
  const newItem = await prisma.jobQuestionAnswer.create({
    data: req.body
  });
  return res.status(201).json(newItem);
}

export async function updateJobQuestionAnswer(req: Request, res: Response) {
  const updated = await prisma.jobQuestionAnswer.update({
    where: { id: req.params['id'] || '' },
    data: req.body
  });
  return res.json(updated);
}

export async function deleteJobQuestionAnswer(req: Request, res: Response) {
  await prisma.jobQuestionAnswer.delete({
    where: { id: req.params['id'] || '' }
  });
  return res.status(204).end();
}
