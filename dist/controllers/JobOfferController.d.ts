import { Request, Response } from "express";
export declare const uploadJobOfferImages: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
export declare function listJobOffers(req: Request, res: Response): Promise<void>;
export declare function getJobOffer(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function createJobOffer(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function updateJobOffer(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function deleteJobOffer(req: Request, res: Response): Promise<void>;
//# sourceMappingURL=JobOfferController.d.ts.map