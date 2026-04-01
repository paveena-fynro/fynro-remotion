/**
 * Fynro Remotion Render Server
 * 
 * Express HTTP server that n8n calls to:
 *  1. POST /render   — trigger a render, returns { renderId, status }
 *  2. GET  /status/:renderId — poll for completion, returns { status, outputUrl }
 * 
 * Run on your server:
 *   node render-server.js
 * 
 * Or deploy to Railway / Render.com as a Node service.
 * 
 * Requires:
 *   npm install express @remotion/bundler @remotion/renderer @remotion/lambda
 */

const express = require("express");
const path    = require("path");
const fs      = require("fs");
const { bundle }       = require("@remotion/bundler");
const { renderMedia, selectComposition } = require("@remotion/renderer");

const app  = express();
const PORT = process.env.PORT || 4000;
app.use(express.json());

// In-memory job store (use Redis for production)
const jobs = {};

// ── POST /render ──────────────────────────────────────────────
app.post("/render", async (req, res) => {
  const { composition = "FinancialOverlay", inputProps = {}, codec = "vp8" } = req.body;

  const renderId = `render_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  jobs[renderId] = { status: "pending", outputUrl: null, error: null };

  // Start render in background — don't await here
  (async () => {
    try {
      jobs[renderId].status = "rendering";

      // Bundle the Remotion project (cache this in production)
      const bundleLocation = await bundle({
        entryPoint: path.join(__dirname, "src", "index.ts"),
        webpackOverride: (config) => config,
      });

      const outputPath = path.join("/tmp", `${renderId}.webm`);

      // Select composition
      const comp = await selectComposition({
        serveUrl: bundleLocation,
        id: composition,
        inputProps,
      });

      // Render to WebM with alpha (transparent background)
      await renderMedia({
        composition: comp,
        serveUrl: bundleLocation,
        codec: "vp8",
        outputLocation: outputPath,
        inputProps,
        pixelFormat: "yuva420p", // alpha channel
        chromiumOptions: { disableWebSecurity: true },
        timeoutInMilliseconds: 300000,
      });

      // Serve the rendered file
      jobs[renderId].status    = "completed";
      jobs[renderId].outputUrl = `http://YOUR_SERVER_URL:${PORT}/output/${renderId}.webm`;
      jobs[renderId].localPath = outputPath;

      console.log(`✅ Render complete: ${renderId}`);
    } catch (err) {
      console.error(`❌ Render error ${renderId}:`, err);
      jobs[renderId].status = "error";
      jobs[renderId].error  = err.message;
    }
  })();

  // Return immediately with job ID
  res.json({ renderId, status: "pending" });
});

// ── GET /status/:renderId ─────────────────────────────────────
app.get("/status/:renderId", (req, res) => {
  const job = jobs[req.params.renderId];
  if (!job) return res.status(404).json({ error: "Job not found" });
  res.json(job);
});

// ── Serve output files ────────────────────────────────────────
app.get("/output/:filename", (req, res) => {
  const filePath = path.join("/tmp", req.params.filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "File not found" });
  }
  res.setHeader("Content-Type", "video/webm");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.sendFile(filePath);
});

// ── Health check ──────────────────────────────────────────────
app.get("/health", (req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`🚀 Fynro Remotion Render Server running on port ${PORT}`);
});
