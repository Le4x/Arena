import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Import des pages (à créer)
import PlayerPage from './apps/player/PlayerPage';
import RegiePage from './apps/regie/RegiePage';
import ScreenPage from './apps/screen/ScreenPage';
import AdminPage from './apps/admin/AdminPage';
import AnimatorPage from './apps/animator/AnimatorPage';
import LoginPage from './apps/auth/LoginPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/play" replace />} />
        <Route path="/play" element={<PlayerPage />} />
        <Route path="/regie" element={<RegiePage />} />
        <Route path="/screen" element={<ScreenPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/animator" element={<AnimatorPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
