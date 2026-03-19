import express from 'express'
import songsRouter from './routes/songs'
import sectionsRouter from './routes/sections'

const app = express()
const PORT = 3001

app.use(express.json())

app.use('/api/songs', songsRouter)
app.use('/api/sections', sectionsRouter)

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
