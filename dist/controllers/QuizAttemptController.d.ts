import { Request, Response } from "express";
export declare function listQuizAttempts(_req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function getQuizAttempt(req: Request, res: Response): Promise<Response>;
export declare function createQuizAttempt(req: Request, res: Response): Promise<Response>;
export declare function updateQuizAttempt(req: Request, res: Response): Promise<Response>;
export declare function deleteQuizAttempt(req: Request, res: Response): Promise<Response>;
export declare function completeQuiz(req: Request, res: Response): Promise<Response>;
//# sourceMappingURL=QuizAttemptController.d.ts.map