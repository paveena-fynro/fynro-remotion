const express = require('express');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 4000;
const jobs = {};

app.get('/health', (req, res) => {
  const activeJobs = Object.values(jobs).filter(j => j.status === 'pending').length;
  res.json({ ok: true, jobs: activeJobs });
});

app.post('/render', (req, res) => {
  const { composition = 'FinancialOverlay', inputProps = {} } = req.body;
  const renderId = `render_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  
  jobs[renderId] = { status: 'pending', outputUrl: null, error: null, startedAt: new Date().toISOString() };
  res.json({ renderId, status: 'pending' });

  setImmediate(async () => {
    try {
      const outputFile = `/tmp/${renderId}.mp4`;
      const propsFile = `/tmp/${renderId}_props.json`;
      fs.writeFileSync(propsFile, JSON.stringify(inputProps));

      const cmd = [
        'npx remotion render',
        composition,
        outputFile,
        '--codec=h264',
        '--image-format=jpeg',
        '--frames=0-1799',
        '--scale=0.5',
        `--props="${propsFile}"`,
        '--log=error',
        '--concurrency=1',
        '--browser-executable=/usr/bin/chromium',
        '--chromium-flags="--no-sandbox --disable-dev-shm-usage --disable-gpu --single-process --no-zygote"'
      ].join(' ');

      execSync(cmd, { cwd: __dirname, timeout: 600000, stdio: 'pipe' });

      const baseUrl = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;
      jobs[renderId].status = 'completed';
      jobs[renderId].outputUrl = `${baseUrl}/output/${renderId}.mp4`;
      jobs[renderId].localPath = outputFile;
      console.log(`✅ Render complete: ${renderId}`);

    } catch (err) {
      console.error(`❌ Render error ${renderId}:`, err.message);
      jobs[renderId].status = 'error';
      jobs[renderId].error = err.message;
    }
  });
});

app.get('/status/:renderId', (req, res) => {
  const job = jobs[req.params.renderId];
  if (!job) return res.status(404).json({ error: 'Not found' });
  res.json({ status: job.status, outputUrl: job.outputUrl, error: job.error, startedAt: job.startedAt });
});

app.get('/output/:filename', (req, res) => {
  const file = `/tmp/${req.params.filename}`;
  if (!fs.existsSync(file)) return res.status(404).json({ error: 'Not found' });
  res.sendFile(file);
});

app.listen(PORT, () => console.log(`🚀 Fynro Remotion Render Server on port ${PORT}`));
