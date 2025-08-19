import { prisma } from "../lib/prisma";
import { Request, Response } from "express";

export async function listNewsComments(_req: Request, res: Response) {
  const items = await prisma.newsComment.findMany();
  return res.json(items);
}

export async function getNewsComment(req: Request, res: Response) {
  const item = await prisma.newsComment.findUnique({
    where: { id: req.params['id'] || '' }
  });
  if (!item) return res.status(404).json({ message: "Not found" });
  return res.json(item);
}

export async function createNewsComment(req: Request, res: Response) {
  const newItem = await prisma.newsComment.create({
    data: req.body
  });
  return res.status(201).json(newItem);
}

export async function updateNewsComment(req: Request, res: Response) {
  const updated = await prisma.newsComment.update({
    where: { id: req.params['id'] || '' },
    data: req.body
  });
  return res.json(updated);
}

export async function deleteNewsComment(req: Request, res: Response) {
  await prisma.newsComment.delete({
    where: { id: req.params['id'] || '' }
  });
  return res.status(204).end();
}
