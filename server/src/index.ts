import express from 'express';
import sectionsRouter from './routes/sections';
import songsRouter from './routes/songs';

const app = express();
const PORT = 3001;

app.use(express.json());

app.use('/api/songs', songsRouter);
app.use('/api/sections', sectionsRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
