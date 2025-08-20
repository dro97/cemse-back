import { Response, NextFunction } from "express";
export declare function performanceMonitor(req: Request, res: Response, next: NextFunction): void;
export declare function errorTracker(err: any, req: Request, _res: Response, next: NextFunction): void;
export declare function requestTracker(req: Request, _res: Response, next: NextFunction): void;
export declare function getPerformanceMetrics(_req: Request, res: Response): Response<any, Record<string, any>>;
export declare function getErrorLogs(_req: Request, res: Response): Response<any, Record<string, any>>;
export declare function getRequestLogs(_req: Request, res: Response): Response<any, Record<string, any>>;
export declare function getHealthWithMetrics(_req: Request, res: Response): Response<any, Record<string, any>>;
export declare function getMemoryUsage(_req: Request, res: Response): Response<any, Record<string, any>>;
export declare function cleanupOldData(): void;
//# sourceMappingURL=monitoring.d.ts.map