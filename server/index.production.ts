import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic, log } from "./vite";
import { cronJobsService } from "./services/cron-jobs";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
  });

  // В production используем только статические файлы
  if (process.env.NODE_ENV === "production") {
    try {
      serveStatic(app);
    } catch (error) {
      log(`Failed to serve static files: ${(error as Error).message}`);
      process.exit(1);
    }
  } else {
    // В development используем Vite middleware (только для локальной разработки)
    const { setupVite } = await import("./vite");
    await setupVite(app, server);
  }

  const port = parseInt(process.env.PORT ?? "5000", 10);

  server.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);
    
    // Start cron jobs for sports API updates
    cronJobsService.start();
  });
})();