import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import MapView from './pages/MapView.jsx';
import Contacts from './pages/Contacts.jsx';
import Settings from './pages/Settings.jsx';
import BottomNav from './components/layout/BottomNav.jsx';
import OfflineBanner from './components/layout/OfflineBanner.jsx';

export default function App() {
  return (
    <div className="min-h-screen bg-ink text-mist">
      <OfflineBanner />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/map" element={<MapView />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
      <BottomNav />
    </div>
  );
}
