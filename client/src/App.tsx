import { BrowserRouter, Routes, Route } from 'react-router-dom'
import SongList from './pages/SongList'
import SongEdit from './pages/SongEdit'
import PrintView from './pages/PrintView'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SongList />} />
        <Route path="/songs/:id" element={<SongEdit />} />
        <Route path="/print" element={<PrintView />} />
      </Routes>
    </BrowserRouter>
  )
}
