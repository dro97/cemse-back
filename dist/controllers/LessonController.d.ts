import { Request, Response } from "express";
export declare function listLessons(_req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function getLesson(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function createLesson(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function updateLesson(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function deleteLesson(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function getLessonsByModule(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=LessonController.d.ts.map