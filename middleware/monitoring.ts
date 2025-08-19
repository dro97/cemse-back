import { Request, Response, NextFunction } from "express";
import { performance } from "perf_hooks";

// Performance metrics storage
interface PerformanceMetrics {
  endpoint: string;
  method: string;
  responseTime: number;
  statusCode: number;
  timestamp: Date;
  userAgent: string | undefined;
  ip: string | undefined;
}

const performanceMetrics: PerformanceMetrics[] = [];

// Error tracking
interface ErrorLog {
  endpoint: string;
  method: string;
  error: string;
  stack: string | undefined;
  timestamp: Date;
  userAgent: string | undefined;
  ip: string | undefined;
}

const errorLogs: ErrorLog[] = [];

// Request tracking
interface RequestLog {
  endpoint: string;
  method: string;
  timestamp: Date;
  userAgent: string | undefined;
  ip: string | undefined;
  userId: string | undefined;
  userRole: string | undefined;
}

const requestLogs: RequestLog[] = [];

// Performance monitoring middleware
export function performanceMonitor(req: Request, res: Response, next: NextFunction) {
  const start = performance.now();
  const originalSend = res.send;

  res.send = function(data) {
    const end = performance.now();
    const responseTime = end - start;

    const metric: PerformanceMetrics = {
      endpoint: req.originalUrl,
      method: req.method,
      responseTime,
      statusCode: res.statusCode,
      timestamp: new Date(),
      userAgent: req.get('User-Agent') || undefined,
      ip: req.ip || req.connection.remoteAddress || undefined
    };

    performanceMetrics.push(metric);

    // Keep only last 1000 metrics to prevent memory issues
    if (performanceMetrics.length > 1000) {
      performanceMetrics.splice(0, performanceMetrics.length - 1000);
    }

    return originalSend.call(this, data);
  };

  next();
}

// Error tracking middleware
export function errorTracker(err: any, req: Request, _res: Response, next: NextFunction) {
  const errorLog: ErrorLog = {
    endpoint: req.originalUrl,
    method: req.method,
    error: err.message,
    stack: err.stack,
    timestamp: new Date(),
    userAgent: req.get('User-Agent') || undefined,
    ip: req.ip || req.connection.remoteAddress || undefined
  };

  errorLogs.push(errorLog);

  // Keep only last 500 error logs
  if (errorLogs.length > 500) {
    errorLogs.splice(0, errorLogs.length - 500);
  }

  console.error('Error tracked:', errorLog);
  next(err);
}

// Request tracking middleware
export function requestTracker(req: Request, _res: Response, next: NextFunction) {
  const requestLog: RequestLog = {
    endpoint: req.originalUrl,
    method: req.method,
    timestamp: new Date(),
    userAgent: req.get('User-Agent') || undefined,
    ip: req.ip || req.connection.remoteAddress || undefined,
    userId: (req as any).user?.id,
    userRole: (req as any).user?.role
  };

  requestLogs.push(requestLog);

  // Keep only last 2000 request logs
  if (requestLogs.length > 2000) {
    requestLogs.splice(0, requestLogs.length - 2000);
  }

  next();
}

// Analytics endpoints
export function getPerformanceMetrics(_req: Request, res: Response) {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  
  const recentMetrics = performanceMetrics.filter(
    metric => metric.timestamp > oneHourAgo
  );

  const averageResponseTime = recentMetrics.length > 0
    ? recentMetrics.reduce((sum, metric) => sum + metric.responseTime, 0) / recentMetrics.length
    : 0;

  const statusCodeCounts = recentMetrics.reduce((counts, metric) => {
    counts[metric.statusCode] = (counts[metric.statusCode] || 0) + 1;
    return counts;
  }, {} as Record<number, number>);

  const endpointCounts = recentMetrics.reduce((counts, metric) => {
    counts[metric.endpoint] = (counts[metric.endpoint] || 0) + 1;
    return counts;
  }, {} as Record<string, number>);

  res.json({
    totalRequests: recentMetrics.length,
    averageResponseTime: Math.round(averageResponseTime * 100) / 100,
    statusCodeCounts,
    endpointCounts,
    timeRange: '1 hour'
  });
}

export function getErrorLogs(_req: Request, res: Response) {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  
  const recentErrors = errorLogs.filter(
    error => error.timestamp > oneHourAgo
  );

  const errorCounts = recentErrors.reduce((counts, error) => {
    counts[error.error] = (counts[error.error] || 0) + 1;
    return counts;
  }, {} as Record<string, number>);

  res.json({
    totalErrors: recentErrors.length,
    errorCounts,
    recentErrors: recentErrors.slice(-10), // Last 10 errors
    timeRange: '1 hour'
  });
}

export function getRequestLogs(_req: Request, res: Response) {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  
  const recentRequests = requestLogs.filter(
    request => request.timestamp > oneHourAgo
  );

  const userRoleCounts = recentRequests.reduce((counts, request) => {
    const role = request.userRole || 'anonymous';
    counts[role] = (counts[role] || 0) + 1;
    return counts;
  }, {} as Record<string, number>);

  const methodCounts = recentRequests.reduce((counts, request) => {
    counts[request.method] = (counts[request.method] || 0) + 1;
    return counts;
  }, {} as Record<string, number>);

  res.json({
    totalRequests: recentRequests.length,
    userRoleCounts,
    methodCounts,
    recentRequests: recentRequests.slice(-20), // Last 20 requests
    timeRange: '1 hour'
  });
}

// Health check with metrics
export function getHealthWithMetrics(_req: Request, res: Response) {
  const now = new Date();
  const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
  
  const recentMetrics = performanceMetrics.filter(
    metric => metric.timestamp > oneMinuteAgo
  );

  const recentErrors = errorLogs.filter(
    error => error.timestamp > oneMinuteAgo
  );

  const averageResponseTime = recentMetrics.length > 0
    ? recentMetrics.reduce((sum, metric) => sum + metric.responseTime, 0) / recentMetrics.length
    : 0;

  const errorRate = recentMetrics.length > 0
    ? (recentErrors.length / recentMetrics.length) * 100
    : 0;

  res.json({
    status: 'OK',
    timestamp: now.toISOString(),
    metrics: {
      requestsPerMinute: recentMetrics.length,
      averageResponseTime: Math.round(averageResponseTime * 100) / 100,
      errorRate: Math.round(errorRate * 100) / 100,
      totalErrors: recentErrors.length
    }
  });
}

// Memory usage monitoring
export function getMemoryUsage(_req: Request, res: Response) {
  const usage = process.memoryUsage();
  
  res.json({
    rss: Math.round(usage.rss / 1024 / 1024 * 100) / 100, // MB
    heapTotal: Math.round(usage.heapTotal / 1024 / 1024 * 100) / 100, // MB
    heapUsed: Math.round(usage.heapUsed / 1024 / 1024 * 100) / 100, // MB
    external: Math.round(usage.external / 1024 / 1024 * 100) / 100, // MB
    arrayBuffers: Math.round(usage.arrayBuffers / 1024 / 1024 * 100) / 100 // MB
  });
}

// Clear old data (run periodically)
export function cleanupOldData() {
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  // Remove metrics older than 1 day
  const metricsToKeep = performanceMetrics.filter(
    metric => metric.timestamp > oneDayAgo
  );
  performanceMetrics.splice(0, performanceMetrics.length - metricsToKeep.length);

  // Remove error logs older than 1 day
  const errorsToKeep = errorLogs.filter(
    error => error.timestamp > oneDayAgo
  );
  errorLogs.splice(0, errorLogs.length - errorsToKeep.length);

  // Remove request logs older than 1 day
  const requestsToKeep = requestLogs.filter(
    request => request.timestamp > oneDayAgo
  );
  requestLogs.splice(0, requestLogs.length - requestsToKeep.length);

  console.log(`Cleaned up old data. Kept ${metricsToKeep.length} metrics, ${errorsToKeep.length} errors, ${requestsToKeep.length} requests`);
}

// Run cleanup every hour
setInterval(cleanupOldData, 60 * 60 * 1000); 