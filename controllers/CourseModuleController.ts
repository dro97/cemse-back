import { prisma } from "../lib/prisma";
import { Request, Response } from "express";

export async function listCourseModules(_req: Request, res: Response) {
  const items = await prisma.courseModule.findMany();
  return res.json(items);
}

export async function getCourseModule(req: Request, res: Response) {
  const item = await prisma.courseModule.findUnique({
    where: { id: req.params['id'] || '' }
  });
  if (!item) return res.status(404).json({ message: "Not found" });
  return res.json(item);
}

export async function createCourseModule(req: Request, res: Response) {
  const newItem = await prisma.courseModule.create({
    data: req.body
  });
  return res.status(201).json(newItem);
}

export async function updateCourseModule(req: Request, res: Response) {
  const updated = await prisma.courseModule.update({
    where: { id: req.params['id'] || '' },
    data: req.body
  });
  return res.json(updated);
}

export async function deleteCourseModule(req: Request, res: Response) {
  await prisma.courseModule.delete({
    where: { id: req.params['id'] || '' }
  });
  return res.status(204).end();
}
