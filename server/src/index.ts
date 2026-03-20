import path from 'node:path';
import express from 'express';
import collectionsRouter from './routes/collections';
import sectionsRouter from './routes/sections';
import settingsRouter from './routes/settings';
import songsRouter from './routes/songs';

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(express.json());

app.use('/api/collections', collectionsRouter);
app.use('/api/songs', songsRouter);
app.use('/api/sections', sectionsRouter);
app.use('/api/settings', settingsRouter);

// Serve built React app in production
const distPath = path.join(__dirname, '../../client/dist');
app.use(express.static(distPath));
app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
