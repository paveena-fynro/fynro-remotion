# Fynro Remotion — Deploy Guide

## What this does
Renders a transparent WebM overlay (charts, number counters, milestone cards)
that FFmpeg composites ON TOP of the HeyGen avatar video.
Avatar audio is never touched — zero voice delay.

---

## Step 1 — Install dependencies

```bash
cd fynro-remotion
npm install
```

---

## Step 2 — Test locally in Remotion Studio

```bash
npm run start
# Opens browser at http://localhost:3000
# You can preview the overlay with sample data
```

---

## Step 3 — Run the render server

```bash
# Install server dependencies
npm install express

# Start server (port 4000)
node render-server.js
```

The server runs at `http://localhost:4000`

### API:
- `POST /render` — starts a render job
- `GET /status/:renderId` — poll for completion
- `GET /output/:filename` — download the rendered WebM

### Test it:
```bash
curl -X POST http://localhost:4000/render \
  -H "Content-Type: application/json" \
  -d '{
    "composition": "FinancialOverlay",
    "inputProps": {
      "userName": "Arumugam",
      "storyTitle": "Test",
      "chapters": [{"title":"Ch1","narration":"test"}],
      "keyMoments": [{"age":30,"label":"Downpayment","amount":"40L","type":"milestone"}],
      "closingLine": "Keep going.",
      "monthlyIncome": 180000,
      "monthlySurplus": 62000,
      "savingsRate": 34,
      "projectionLedger": [{"age":25,"fund_value":1000000},{"age":58,"fund_value":50000000}],
      "retirementCorpus": 50000000
    }
  }'
# Returns: { "renderId": "render_xxx", "status": "pending" }

curl http://localhost:4000/status/render_xxx
# Returns: { "status": "completed", "outputUrl": "http://..." }
```

---

## Step 4 — Deploy to Railway (recommended, free tier)

1. Push this folder to a GitHub repo
2. Go to railway.app → New Project → Deploy from GitHub
3. Set environment variable: `PORT=4000`
4. Railway gives you a public URL like `https://fynro-remotion.up.railway.app`
5. Update n8n `Remotion Render Overlay` node URL to that URL

---

## Step 5 — Update n8n nodes

In n8n workflow, update these two nodes:

**Remotion Render Overlay node:**
- URL: `https://YOUR_RAILWAY_URL/render`

**Poll Remotion Status node:**
- URL: `https://YOUR_RAILWAY_URL/status/{{ $('Remotion Render Overlay').first().json.renderId }}`

---

## Step 6 — FFmpeg on your n8n server

The `FFmpeg Merge + Music` node runs `ffmpeg` as a shell command on the n8n server.
Make sure FFmpeg is installed:

```bash
# Ubuntu/Debian (self-hosted n8n)
sudo apt-get install -y ffmpeg

# Verify
ffmpeg -version
```

### What the FFmpeg command does:
1. Downloads HeyGen video → `/tmp/heygen_USERNAME.mp4`
2. Downloads Remotion overlay → `/tmp/overlay_USERNAME.webm`
3. Composites overlay ON TOP of video (transparent WebM shows through)
4. Mixes background music at 12% volume with fade in/out
5. Outputs → `/tmp/fynro_final_USERNAME.mp4`

---

## Background Music

Upload a 2–3 minute ambient/instrumental track to Supabase Storage or S3.
Replace `YOUR_CDN_URL` in the FFmpeg node with the public URL.

Recommended: 
- Royalty-free ambient piano or soft electronic
- 2+ minutes length (auto-loops in FFmpeg)
- ~320kbps MP3

---

## File structure

```
fynro-remotion/
├── package.json
├── tsconfig.json
├── remotion.config.ts
├── render-server.js          ← HTTP server n8n calls
├── DEPLOY.md                 ← this file
└── src/
    ├── index.ts              ← entry point
    ├── Root.tsx              ← registers composition
    ├── types.ts              ← shared TypeScript types
    └── compositions/
        └── FinancialOverlay.tsx   ← main overlay (3 chapters)
    └── components/
        ├── WealthChart.tsx        ← animated SVG line chart
        ├── MilestoneCard.tsx      ← milestone pop-up cards
        ├── NumberCounter.tsx      ← counting-up numbers
        ├── ChapterTitle.tsx       ← chapter heading
        └── IncomeBar.tsx          ← income vs surplus bar
```
