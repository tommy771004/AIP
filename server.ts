import express from "express";
import path from "path";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import {
  getFirContactsPaginated,
  validateAllSources,
  SCRAPER_SOURCES,
} from "./src/api/scraper.js";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // ──────────────────────────────────────────────
  //  API Routes
  // ──────────────────────────────────────────────

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  /**
   * GET /api/contacts
   * Query params:
   *   regionCode  - filter by 2-letter region code (TW, JP, AU, UK, US)
   *   page        - 1-indexed page number (default 1)
   *   pageSize    - items per page (default 20, max 100)
   */
  app.get("/api/contacts", async (req, res) => {
    try {
      const regionCode = typeof req.query.regionCode === "string"
        ? req.query.regionCode
        : undefined;
      const page = Math.max(1, parseInt(String(req.query.page ?? "1"), 10) || 1);
      const pageSize = Math.min(
        100,
        Math.max(1, parseInt(String(req.query.pageSize ?? "20"), 10) || 20)
      );

      const result = await getFirContactsPaginated({ regionCode, page, pageSize });
      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error("Scraper Error:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  /**
   * GET /api/regions
   * Returns the list of known scraper region codes and their display names.
   */
  app.get("/api/regions", (_req, res) => {
    const regions = Object.entries(SCRAPER_SOURCES).map(([key, s]) => ({
      key,
      regionCode: s.regionCode,
      region: s.firName,
      sourceName: s.name,
      sourceUrl: s.url,
    }));
    res.json({ success: true, data: regions });
  });

  /**
   * GET /api/sources/validate
   * Checks whether each configured eAIP source URL is reachable.
   */
  app.get("/api/sources/validate", async (_req, res) => {
    try {
      const validations = await validateAllSources();
      res.json({ success: true, data: validations });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // ──────────────────────────────────────────────
  //  Vite Middleware & Static Serving
  // ──────────────────────────────────────────────
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
