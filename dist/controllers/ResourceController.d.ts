import { Request, Response } from "express";
export declare function listResources(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function getResource(req: Request, res: Response): Promise<Response>;
export declare function createResource(req: Request, res: Response): Promise<Response>;
export declare function updateResource(req: Request, res: Response): Promise<Response>;
export declare function deleteResource(req: Request, res: Response): Promise<Response>;
export declare function getMunicipalityResources(req: Request, res: Response): Promise<Response>;
export declare function searchMunicipalityResources(req: Request, res: Response): Promise<Response>;
//# sourceMappingURL=ResourceController.d.ts.map