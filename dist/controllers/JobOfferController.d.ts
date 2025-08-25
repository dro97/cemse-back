import { Request, Response } from "express";
interface MinIORequest extends Request {
    uploadedJobImages?: {
        images?: Array<{
            url: string;
            filename: string;
            originalName: string;
            size: number;
            mimetype: string;
            bucket: string;
        }>;
        logo?: {
            url: string;
            filename: string;
            originalName: string;
            size: number;
            mimetype: string;
            bucket: string;
        };
    };
}
export declare function listJobOffers(req: Request, res: Response): Promise<void>;
export declare function getJobOffer(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function createJobOffer(req: MinIORequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function updateJobOffer(req: MinIORequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function deleteJobOffer(req: Request, res: Response): Promise<void>;
export {};
//# sourceMappingURL=JobOfferController.d.ts.map