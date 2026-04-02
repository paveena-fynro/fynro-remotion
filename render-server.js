const express = require('express');
const { execSync } = require('child_process');
const fs = require('fs');

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 4000;
const jobs = {};

app.get('/health', (req, res) => {
  res.json({ ok: true, jobs: Object.values(jobs).filter(j => j.status === 'pending').length });
});

app.post('/render', (req, res) => {
  const { composition = 'FinancialOverlay', inputProps = {} } = req.body;
  const renderId = `render_${Date.now()}_${Math.random().toString(36).slice(2,7)}`;
  jobs[renderId] = { status: 'pending', outputUrl: null, error: null, startedAt: new Date().toISOString() };
  res.json({ renderId, status: 'pending' });

  setImmediate(() => {
    try {
      const outputFile = `/tmp/${renderId}.mp4`;
      const propsFile = `/tmp/${renderId}_props.json`;
      fs.writeFileSync(propsFile, JSON.stringify(inputProps));

      // Full duration, full quality - runs on Mac with 8GB RAM
      const cmd = [
        'npx remotion render', composition, outputFile,
        '--codec=h264',
        '--image-format=jpeg',
        `--props="${propsFile}"`,
        '--log=error',
        '--concurrency=1'
      ].join(' ');

      console.log(`🎬 Rendering ${renderId}...`);
      execSync(cmd, { cwd: __dirname, timeout: 600000, stdio: 'pipe' });

      // Upload to 0x0.st - free public URL, no account needed
      console.log(`📤 Uploading ${renderId}...`);
      const uploadResult = execSync(`curl -s -F "file=@${outputFile}" https://file.io --max-time 120`).toString().trim();
      const uploadJson = JSON.parse(uploadResult);
      const publicUrl = uploadJson.link || uploadJson.url || uploadResult;

      jobs[renderId].status = 'completed';
      jobs[renderId].outputUrl = publicUrl;
      console.log(`✅ Done: ${publicUrl}`);
    } catch (err) {
      console.error(`❌ Error: ${err.message.substring(0, 300)}`);
      jobs[renderId].status = 'error';
      jobs[renderId].error = err.message.substring(0, 500);
    }
  });
});

app.get('/status/:id', (req, res) => {
  const job = jobs[req.params.id];
  if (!job) return res.status(404).json({ error: 'Not found' });
  res.json({ status: job.status, outputUrl: job.outputUrl, error: job.error, startedAt: job.startedAt });
});

app.listen(PORT, () => console.log(`🚀 Fynro Remotion Render Server on port ${PORT}`));
