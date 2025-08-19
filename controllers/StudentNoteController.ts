import { prisma } from "../lib/prisma";
import { Request, Response } from "express";

export async function listStudentNotes(_req: Request, res: Response) {
  const items = await prisma.studentNote.findMany();
  return res.json(items);
}

export async function getStudentNote(req: Request, res: Response) {
  const item = await prisma.studentNote.findUnique({
    where: { id: req.params['id'] || '' }
  });
  if (!item) return res.status(404).json({ message: "Not found" });
  return res.json(item);
}

export async function createStudentNote(req: Request, res: Response) {
  const newItem = await prisma.studentNote.create({
    data: req.body
  });
  return res.status(201).json(newItem);
}

export async function updateStudentNote(req: Request, res: Response) {
  const updated = await prisma.studentNote.update({
    where: { id: req.params['id'] || '' },
    data: req.body
  });
  return res.json(updated);
}

export async function deleteStudentNote(req: Request, res: Response) {
  await prisma.studentNote.delete({
    where: { id: req.params['id'] || '' }
  });
  return res.status(204).end();
}
