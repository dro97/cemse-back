import { Request, Response } from "express";
export declare function listCourses(_req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function getCourse(req: Request, res: Response): Promise<Response>;
export declare function getCoursePreview(req: Request, res: Response): Promise<Response>;
export declare function createCourse(req: Request, res: Response): Promise<Response>;
export declare function updateCourse(req: Request, res: Response): Promise<Response>;
export declare function deleteCourse(req: Request, res: Response): Promise<Response>;
//# sourceMappingURL=CourseController.d.ts.map