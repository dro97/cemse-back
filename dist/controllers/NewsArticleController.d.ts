import { Request, Response } from "express";
interface MinIORequest extends Request {
    uploadedImages?: {
        [key: string]: {
            url: string;
            filename: string;
            originalName: string;
            size: number;
            mimetype: string;
            bucket: string;
        };
    };
}
export declare function listNewsArticles(req: Request, res: Response): Promise<Response>;
export declare function listPublicNewsArticles(req: Request, res: Response): Promise<Response>;
export declare function getNewsArticle(req: Request, res: Response): Promise<Response>;
export declare function createNewsArticle(req: MinIORequest, res: Response): Promise<Response>;
export declare function updateNewsArticle(req: MinIORequest, res: Response): Promise<Response>;
export declare function deleteNewsArticle(req: Request, res: Response): Promise<Response>;
export {};
//# sourceMappingURL=NewsArticleController.d.ts.map