export declare const uploadImageToMinIO: (req: any, res: any, next: any) => void;
export declare const uploadMultipleImagesToMinIO: (req: any, res: any, next: any) => void;
export declare const uploadDocumentsToMinIO: (req: any, res: any, next: any) => void;
export declare const uploadCourseFilesToMinIO: (req: any, res: any, next: any) => void;
export declare const uploadLessonVideo: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
export declare const processAndUploadVideo: (req: any, res: any, next: any) => Promise<any>;
export declare const uploadLessonFiles: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
export declare const processAndUploadLessonFiles: (req: any, res: any, next: any) => Promise<any>;
export declare const uploadLessonResourceToMinIO: (req: any, res: any, next: any) => void;
export declare const uploadResourceToMinIO: (req: any, res: any, next: any) => void;
//# sourceMappingURL=minioUpload.d.ts.map