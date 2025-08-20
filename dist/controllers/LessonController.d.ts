import { Request, Response } from "express";
interface RequestWithUploadedFiles extends Request {
    uploadedFiles?: {
        video?: {
            url: string;
            filename: string;
            originalName: string;
            size: number;
            mimetype: string;
            bucket: string;
        };
        thumbnail?: {
            url: string;
            filename: string;
            originalName: string;
            size: number;
            mimetype: string;
            bucket: string;
        };
        attachments?: Array<{
            url: string;
            filename: string;
            originalName: string;
            size: number;
            mimetype: string;
            bucket: string;
        }>;
    };
    uploadedVideo?: {
        url: string;
        filename: string;
        originalName: string;
        size: number;
        mimetype: string;
        bucket: string;
    };
}
export declare function listLessons(_req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function getLesson(req: Request, res: Response): Promise<Response>;
export declare function createLesson(req: RequestWithUploadedFiles, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function updateLesson(req: Request, res: Response): Promise<Response>;
export declare function deleteLesson(req: Request, res: Response): Promise<Response>;
export declare function getLessonsByModule(req: Request, res: Response): Promise<Response>;
export {};
//# sourceMappingURL=LessonController.d.ts.map