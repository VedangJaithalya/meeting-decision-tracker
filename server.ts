import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { extractMeetingData } from './server/extract.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

app.post('/api/extract', async (req, res) => {
  try {
    const { text, docTitle } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ ok: false, error: 'Meeting notes text is required' });
    }
    const result = await extractMeetingData(text, docTitle);
    return res.json({ ok: true, data: result });
  } catch (err: any) {
    console.error('Server extraction error:', err);
    return res.status(500).json({ ok: false, error: err.message || 'Extraction failed' });
  }
});

// Serve static assets from Vite build in production
const distPath = path.resolve(__dirname, 'dist');
app.use(express.static(distPath));

app.get('*', (_req, res) => {
  res.sendFile(path.resolve(distPath, 'index.html'));
});

app.listen(port, () => {
  console.log(`Meeting Decision Tracker server running on port ${port}`);
});
