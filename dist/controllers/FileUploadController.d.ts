import { Request, Response } from "express";
export declare const uploadProfileImage: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
export declare const uploadLessonVideo: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
export declare const uploadCV: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
export declare const uploadCoverLetter: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
export declare function uploadProfileImageHandler(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function uploadCVHandler(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function uploadCoverLetterHandler(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function uploadLessonVideoHandler(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function uploadGenericFileHandler(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare const uploadGenericFile: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
//# sourceMappingURL=FileUploadController.d.ts.map