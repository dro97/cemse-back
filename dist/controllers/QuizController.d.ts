import { Request, Response } from "express";
export declare function listQuizs(_req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function getQuiz(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function createQuiz(req: Request, res: Response): Promise<void>;
export declare function updateQuiz(req: Request, res: Response): Promise<void>;
export declare function deleteQuiz(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=QuizController.d.ts.map