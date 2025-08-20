import { Request, Response } from "express";
export declare function listRefreshTokens(_req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function getRefreshToken(req: Request, res: Response): Promise<Response>;
export declare function createRefreshToken(req: Request, res: Response): Promise<Response>;
export declare function updateRefreshToken(req: Request, res: Response): Promise<Response>;
export declare function deleteRefreshToken(req: Request, res: Response): Promise<Response>;
//# sourceMappingURL=RefreshTokenController.d.ts.map