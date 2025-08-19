import express from "express";
import cors from "cors";
import { json } from "body-parser";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { createServer } from "http";
import { Server } from "socket.io";
import * as routes from "./routes";
import { requestLogger, errorHandler } from "./middleware/auth";
import path from "path";
import { 
  performanceMonitor, 
  errorTracker, 
  requestTracker,
  getPerformanceMetrics,
  getErrorLogs,
  getRequestLogs,
  getHealthWithMetrics,
  getMemoryUsage
} from "./middleware/monitoring";
import { initializeBuckets } from "./lib/minio";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: [" GET", "POST"]
  }
});

const PORT = process.env["PORT"] || 3001;

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Full Express API",
      version: "1.0.0",
      description: "A comprehensive Express API with Prisma",
    },
    servers: [
      {
        url: `http://localhost:${PORT}/api`,
        description: "Development server (localhost)",
      },
      {
        url: `http://0.0.0.0:${PORT}/api`,
        description: "Development server (network)",
      },
      {
        url: `https://back-end-production-17b6.up.railway.app/api`,
        description: "Production server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ["./controllers/*.ts", "./routes/*.ts"],
};

const specs = swaggerJsdoc(swaggerOptions);

// Middleware
app.use(cors());
app.use(requestLogger);
app.use(performanceMonitor);
app.use(requestTracker);

// JSON parsing middleware - apply only to specific routes that need it
app.use('/api/auth', json({ limit: '10mb' }));
app.use('/api/company', json({ limit: '10mb' }));
app.use('/api/municipality', json({ limit: '10mb' }));
app.use('/api/institution', json({ limit: '10mb' }));
app.use('/api/entrepreneurship', json({ limit: '10mb' }));
app.use('/api/businessplan', json({ limit: '10mb' }));
app.use('/api/joboffer', json({ limit: '10mb' }));
app.use('/api/jobapplication', json({ limit: '10mb' }));
app.use('/api/profile', json({ limit: '10mb' }));
app.use('/api/analytics', json({ limit: '10mb' }));
app.use('/api/course', json({ limit: '10mb' }));
app.use('/api/newsarticle/json', json({ limit: '10mb' })); // JSON endpoint for news articles without file upload

// Note: /api/newsarticle routes will use multer for multipart/form-data requests (with image uploads)
// and the uploadSingleImage middleware handles both files and form fields

// Serve static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Make io available to controllers
(app as any).io = io;

// API routes
app.use("/api", routes.default);

// Analytics routes (protected by authentication)
app.get("/api/analytics/performance", getPerformanceMetrics);
app.get("/api/analytics/errors", getErrorLogs);
app.get("/api/analytics/requests", getRequestLogs);
app.get("/api/analytics/memory", getMemoryUsage);

// Swagger documentation
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(specs));

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Join room based on user role
  socket.on("join-room", (role: string) => {
    socket.join(role);
    console.log(`User ${socket.id} joined room: ${role}`);
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Error handling middleware (must be last)
app.use(errorTracker);
app.use(errorHandler);

// Health check endpoints
app.get("/health", (_req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

app.get("/health/metrics", getHealthWithMetrics);

// Start server
server.listen(PORT, '0.0.0.0', async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Server accessible from network at http://0.0.0.0:${PORT}`);
  console.log(`📚 Swagger docs available at http://localhost:${PORT}/api/docs`);
  console.log(`🔌 Socket.IO server running on port ${PORT}`);
  console.log(`📊 Analytics available at http://localhost:${PORT}/api/analytics`);
  
  // Initialize MinIO buckets
  try {
    await initializeBuckets();
    console.log(`☁️ MinIO buckets initialized successfully`);
  } catch (error) {
    console.error(`❌ Error initializing MinIO buckets:`, error);
  }
});

export { app, io };
