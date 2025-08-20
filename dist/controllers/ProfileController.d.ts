import { Request, Response } from "express";
export declare function listProfiles(_: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function getMyProfile(req: Request, res: Response): Promise<Response>;
export declare function getProfile(req: Request, res: Response): Promise<Response>;
export declare function createProfile(req: Request, res: Response): Promise<Response>;
export declare function updateProfile(req: Request, res: Response): Promise<Response>;
export declare function deleteProfile(req: Request, res: Response): Promise<Response>;
export declare function updateProfileAvatar(req: Request, res: Response): Promise<Response>;
export declare function getExternalProfile(req: Request, res: Response): Promise<Response>;
//# sourceMappingURL=ProfileController.d.ts.map