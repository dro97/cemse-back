import { Request, Response, NextFunction } from "express";
import { UserRole } from "@prisma/client";
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                username: string;
                role?: UserRole;
                type?: 'user' | 'municipality' | 'company';
            };
        }
    }
}
export declare function authenticateToken(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
export declare function requireRole(allowedRoles: UserRole[]): (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
export declare const requireSuperAdmin: (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
export declare const requireAdmin: (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
export declare const requireClient: (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
export declare const requireAgent: (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
export declare const requireJovenes: (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
export declare const requireAdolescentes: (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
export declare const requireEmpresas: (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
export declare const requireGobiernos: (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
export declare const requireCentros: (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
export declare const requireOngs: (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
export declare const requireInstructor: (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
export declare const requireStudent: (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
export declare const requireOrganization: (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
export declare function requireEntityType(allowedTypes: ('user' | 'municipality' | 'company')[]): (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
export declare const requireUser: (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
export declare const requireMunicipality: (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
export declare const requireCompany: (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
export declare const requireOrganizationEntity: (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
export declare function optionalAuth(req: Request, _res: Response, next: NextFunction): Promise<void>;
export declare function requireOwnership(resourceModel: string, idParam?: string): (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
export declare function rateLimit(maxRequests?: number, windowMs?: number): (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
export declare function requestLogger(req: Request, res: Response, next: NextFunction): void;
export declare function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction): Response<any, Record<string, any>>;
//# sourceMappingURL=auth.d.ts.map