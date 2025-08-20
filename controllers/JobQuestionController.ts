import { prisma } from "../lib/prisma";
import { Request, Response } from "express";

export async function listJobQuestions(_req: Request, res: Response) {
  const items = await prisma.jobQuestion.findMany();
  return res.json(items);
}

export async function getJobQuestion(req: Request, res: Response): Promise<Response> {
  const item = await prisma.jobQuestion.findUnique({
    where: { id: req.params['id'] || '' }
  });
  if (!item) return res.status(404).json({ message: "Not found" });
  return res.json(item);
}

export async function createJobQuestion(req: Request, res: Response): Promise<Response> {
  const newItem = await prisma.jobQuestion.create({
    data: req.body
  });
  return res.status(201).json(newItem);
}

export async function updateJobQuestion(req: Request, res: Response): Promise<Response> {
  const updated = await prisma.jobQuestion.update({
    where: { id: req.params['id'] || '' },
    data: req.body
  });
  return res.json(updated);
}

export async function deleteJobQuestion(req: Request, res: Response): Promise<Response> {
  await prisma.jobQuestion.delete({
    where: { id: req.params['id'] || '' }
  });
  return res.status(204).end();
}
