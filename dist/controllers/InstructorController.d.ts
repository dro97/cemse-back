import { Request, Response } from "express";
export declare function listInstructors(_req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function getInstructor(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function createInstructor(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function updateInstructor(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function deleteInstructor(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function instructorLogin(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function getInstructorStats(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=InstructorController.d.ts.map