import { Request, Response } from "express";
export declare function listJobOffers(_: Request, res: Response): Promise<void>;
export declare function getJobOffer(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function createJobOffer(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function updateJobOffer(req: Request, res: Response): Promise<void>;
export declare function deleteJobOffer(req: Request, res: Response): Promise<void>;
//# sourceMappingURL=JobOfferController.d.ts.map