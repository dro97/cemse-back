import { prisma } from "../lib/prisma";
import { Request, Response } from "express";

export async function listDiscussions(_req: Request, res: Response) {
  const items = await prisma.discussion.findMany();
  return res.json(items);
}

export async function getDiscussion(req: Request, res: Response): Promise<Response> {
  const item = await prisma.discussion.findUnique({
    where: { id: req.params['id'] || '' }
  });
  if (!item) return res.status(404).json({ message: "Not found" });
  return res.json(item);
}

export async function createDiscussion(req: Request, res: Response): Promise<Response> {
  const { lessonId, userId, content, parentId } = req.body;
  
  if (!lessonId || !userId || !content) {
    return res.status(400).json({ message: "lessonId, userId, and content are required" });
  }

  const newItem = await prisma.discussion.create({
    data: {
      lessonId,
      userId,
      content,
      parentId: parentId || null,
      likes: 0
    } as any
  });
  return res.status(201).json(newItem);
}

export async function updateDiscussion(req: Request, res: Response): Promise<Response> {
  const updated = await prisma.discussion.update({
    where: { id: req.params['id'] || '' },
    data: req.body
  });
  return res.json(updated);
}

export async function deleteDiscussion(req: Request, res: Response): Promise<Response> {
  await prisma.discussion.delete({
    where: { id: req.params['id'] || '' }
  });
  return res.status(204).end();
}
