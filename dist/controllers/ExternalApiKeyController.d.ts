import { Request, Response } from "express";
declare function requireSuperAdmin(req: Request, res: Response, next: Function): void | Response;
export declare const createExternalApiKey: (typeof requireSuperAdmin | ((req: Request, res: Response) => Promise<Response<any, Record<string, any>>>))[];
export declare const listExternalApiKeys: (typeof requireSuperAdmin | ((_: Request, res: Response) => Promise<Response<any, Record<string, any>>>))[];
export declare const revokeExternalApiKey: (typeof requireSuperAdmin | ((req: Request, res: Response) => Promise<Response<any, Record<string, any>>>))[];
export {};
//# sourceMappingURL=ExternalApiKeyController.d.ts.map