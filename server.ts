import express from "express";
import path from "path";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import { getFirContacts } from "./src/api/scraper.js";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // ==========================================
  // API Routes (Must be defined BEFORE Vite middleware)
  // ==========================================
  
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Main endpoint to fetch FIR contacts using the scraper
  app.get("/api/contacts", async (req, res) => {
    try {
      const contacts = await getFirContacts();
      res.json({ success: true, data: contacts });
    } catch (error: any) {
      console.error("Scraper Error:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // ==========================================
  // Vite Middleware & Static Serving
  // ==========================================
  if (process.env.NODE_ENV !== "production") {
    // Development mode: Use Vite's middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production mode: Serve static files from dist/
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
