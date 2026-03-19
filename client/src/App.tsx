import { BrowserRouter, Route, Routes } from 'react-router-dom';
import PrintView from './pages/PrintView';
import SongEdit from './pages/SongEdit';
import SongList from './pages/SongList';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SongList />} />
        <Route path="/songs/:id" element={<SongEdit />} />
        <Route path="/print" element={<PrintView />} />
      </Routes>
    </BrowserRouter>
  );
}
