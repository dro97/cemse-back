import { Request, Response } from "express";
export declare const uploadProfileImage: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
export declare const uploadLessonVideo: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
export declare function uploadProfileImageHandler(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function uploadLessonVideoHandler(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function serveImage(req: Request, res: Response): Promise<void | Response<any, Record<string, any>>>;
export declare function serveVideo(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=FileUploadController.d.ts.map