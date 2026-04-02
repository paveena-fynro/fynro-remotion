/**
 * Fynro Remotion Render Server - FIXED
 */
const express = require('express');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

const app = express();
const PORT = process.env.PORT || 4000;
app.use(express.json({ limit: '10mb' }));

const jobs = {};

app.get('/health', (req, res) => {
  res.json({ ok: true, jobs: Object.keys(jobs).length });
});

app.post('/render', async (req, res) => {
  const { composition = 'FinancialOverlay', inputProps = {} } = req.body;
  const renderId = `render_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  jobs[renderId] = { status: 'pending', outputUrl: null, error: null, startedAt: new Date() };
  res.json({ renderId, status: 'pending' });

  setImmediate(async () => {
    try {
      jobs[renderId].status = 'rendering';

      const outputFile = `/tmp/${renderId}.mp4`;
      const propsFile = `/tmp/${renderId}_props.json`;
      fs.writeFileSync(propsFile, JSON.stringify(inputProps));

      // FIX: Use mp4 codec with libx264 (no transparency needed for overlay)
      // This avoids the yuva420p PNG format requirement
      const cmd = [
        'npx remotion render',
        composition,
        outputFile,
        '--codec=h264',          // h264 instead of vp8/yuva420p
        '--image-format=jpeg',   // jpeg instead of png - much faster
        `--props="${propsFile}"`,
        '--log=error',
        '--concurrency=1 --browser-executable=/usr/bin/chromium --chromium-flags="--no-sandbox --disable-dev-shm-usage --disable-gpu"'
      ].join(' ');

      execSync(cmd, {
        cwd: __dirname,
        timeout: 600000,
        stdio: 'pipe'
      });

      const baseUrl = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;
      jobs[renderId].status = 'completed';
      jobs[renderId].outputUrl = `${baseUrl}/output/${renderId}.mp4`;
      jobs[renderId].localPath = outputFile;
      console.log(`✅ Render complete: ${renderId}`);

    } catch (err) {
      console.error(`❌ Render error ${renderId}:`, err.message);
      jobs[renderId].status = 'error';
      jobs[renderId].error = err.message?.substring(0, 500);
    }
  });
});

app.get('/status/:renderId', (req, res) => {
  const job = jobs[req.params.renderId];
  if (!job) return res.status(404).json({ error: 'Job not found' });
  res.json(job);
});

app.get('/output/:filename', (req, res) => {
  const filePath = path.join('/tmp', req.params.filename);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found' });
  res.setHeader('Content-Type', 'video/mp4');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.sendFile(filePath);
});

app.listen(PORT, () => {
  console.log(`🚀 Fynro Remotion Render Server on port ${PORT}`);
});
