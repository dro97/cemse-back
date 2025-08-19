import { Request, Response, NextFunction } from "express";
export declare function performanceMonitor(req: Request, res: Response, next: NextFunction): void;
export declare function errorTracker(err: any, req: Request, _res: Response, next: NextFunction): void;
export declare function requestTracker(req: Request, _res: Response, next: NextFunction): void;
export declare function getPerformanceMetrics(_req: Request, res: Response): void;
export declare function getErrorLogs(_req: Request, res: Response): void;
export declare function getRequestLogs(_req: Request, res: Response): void;
export declare function getHealthWithMetrics(_req: Request, res: Response): void;
export declare function getMemoryUsage(_req: Request, res: Response): void;
export declare function cleanupOldData(): void;
//# sourceMappingURL=monitoring.d.ts.map