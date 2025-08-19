"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.performanceMonitor = performanceMonitor;
exports.errorTracker = errorTracker;
exports.requestTracker = requestTracker;
exports.getPerformanceMetrics = getPerformanceMetrics;
exports.getErrorLogs = getErrorLogs;
exports.getRequestLogs = getRequestLogs;
exports.getHealthWithMetrics = getHealthWithMetrics;
exports.getMemoryUsage = getMemoryUsage;
exports.cleanupOldData = cleanupOldData;
const perf_hooks_1 = require("perf_hooks");
const performanceMetrics = [];
const errorLogs = [];
const requestLogs = [];
function performanceMonitor(req, res, next) {
    const start = perf_hooks_1.performance.now();
    const originalSend = res.send;
    res.send = function (data) {
        const end = perf_hooks_1.performance.now();
        const responseTime = end - start;
        const metric = {
            endpoint: req.originalUrl,
            method: req.method,
            responseTime,
            statusCode: res.statusCode,
            timestamp: new Date(),
            userAgent: req.get('User-Agent') || undefined,
            ip: req.ip || req.connection.remoteAddress || undefined
        };
        performanceMetrics.push(metric);
        if (performanceMetrics.length > 1000) {
            performanceMetrics.splice(0, performanceMetrics.length - 1000);
        }
        return originalSend.call(this, data);
    };
    next();
}
function errorTracker(err, req, _res, next) {
    const errorLog = {
        endpoint: req.originalUrl,
        method: req.method,
        error: err.message,
        stack: err.stack,
        timestamp: new Date(),
        userAgent: req.get('User-Agent') || undefined,
        ip: req.ip || req.connection.remoteAddress || undefined
    };
    errorLogs.push(errorLog);
    if (errorLogs.length > 500) {
        errorLogs.splice(0, errorLogs.length - 500);
    }
    console.error('Error tracked:', errorLog);
    next(err);
}
function requestTracker(req, _res, next) {
    const requestLog = {
        endpoint: req.originalUrl,
        method: req.method,
        timestamp: new Date(),
        userAgent: req.get('User-Agent') || undefined,
        ip: req.ip || req.connection.remoteAddress || undefined,
        userId: req.user?.id,
        userRole: req.user?.role
    };
    requestLogs.push(requestLog);
    if (requestLogs.length > 2000) {
        requestLogs.splice(0, requestLogs.length - 2000);
    }
    next();
}
function getPerformanceMetrics(_req, res) {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const recentMetrics = performanceMetrics.filter(metric => metric.timestamp > oneHourAgo);
    const averageResponseTime = recentMetrics.length > 0
        ? recentMetrics.reduce((sum, metric) => sum + metric.responseTime, 0) / recentMetrics.length
        : 0;
    const statusCodeCounts = recentMetrics.reduce((counts, metric) => {
        counts[metric.statusCode] = (counts[metric.statusCode] || 0) + 1;
        return counts;
    }, {});
    const endpointCounts = recentMetrics.reduce((counts, metric) => {
        counts[metric.endpoint] = (counts[metric.endpoint] || 0) + 1;
        return counts;
    }, {});
    res.json({
        totalRequests: recentMetrics.length,
        averageResponseTime: Math.round(averageResponseTime * 100) / 100,
        statusCodeCounts,
        endpointCounts,
        timeRange: '1 hour'
    });
}
function getErrorLogs(_req, res) {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const recentErrors = errorLogs.filter(error => error.timestamp > oneHourAgo);
    const errorCounts = recentErrors.reduce((counts, error) => {
        counts[error.error] = (counts[error.error] || 0) + 1;
        return counts;
    }, {});
    res.json({
        totalErrors: recentErrors.length,
        errorCounts,
        recentErrors: recentErrors.slice(-10),
        timeRange: '1 hour'
    });
}
function getRequestLogs(_req, res) {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const recentRequests = requestLogs.filter(request => request.timestamp > oneHourAgo);
    const userRoleCounts = recentRequests.reduce((counts, request) => {
        const role = request.userRole || 'anonymous';
        counts[role] = (counts[role] || 0) + 1;
        return counts;
    }, {});
    const methodCounts = recentRequests.reduce((counts, request) => {
        counts[request.method] = (counts[request.method] || 0) + 1;
        return counts;
    }, {});
    res.json({
        totalRequests: recentRequests.length,
        userRoleCounts,
        methodCounts,
        recentRequests: recentRequests.slice(-20),
        timeRange: '1 hour'
    });
}
function getHealthWithMetrics(_req, res) {
    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
    const recentMetrics = performanceMetrics.filter(metric => metric.timestamp > oneMinuteAgo);
    const recentErrors = errorLogs.filter(error => error.timestamp > oneMinuteAgo);
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
function getMemoryUsage(_req, res) {
    const usage = process.memoryUsage();
    res.json({
        rss: Math.round(usage.rss / 1024 / 1024 * 100) / 100,
        heapTotal: Math.round(usage.heapTotal / 1024 / 1024 * 100) / 100,
        heapUsed: Math.round(usage.heapUsed / 1024 / 1024 * 100) / 100,
        external: Math.round(usage.external / 1024 / 1024 * 100) / 100,
        arrayBuffers: Math.round(usage.arrayBuffers / 1024 / 1024 * 100) / 100
    });
}
function cleanupOldData() {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const metricsToKeep = performanceMetrics.filter(metric => metric.timestamp > oneDayAgo);
    performanceMetrics.splice(0, performanceMetrics.length - metricsToKeep.length);
    const errorsToKeep = errorLogs.filter(error => error.timestamp > oneDayAgo);
    errorLogs.splice(0, errorLogs.length - errorsToKeep.length);
    const requestsToKeep = requestLogs.filter(request => request.timestamp > oneDayAgo);
    requestLogs.splice(0, requestLogs.length - requestsToKeep.length);
    console.log(`Cleaned up old data. Kept ${metricsToKeep.length} metrics, ${errorsToKeep.length} errors, ${requestsToKeep.length} requests`);
}
setInterval(cleanupOldData, 60 * 60 * 1000);
//# sourceMappingURL=monitoring.js.map