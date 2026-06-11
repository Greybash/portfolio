// ============================================================
// EVENT HORIZON INFRASTRUCTURE — Main App Router
// Routes between the 3D experience and the admin dashboard
// ============================================================

import { HashRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { HomePage } from '@/pages/HomePage';
import { AdminPage } from '@/pages/AdminPage';
import { TestPage } from '@/pages/TestPage';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/test" element={<TestPage />} />
        <Route path="/void-control-center" element={<AdminPage />} />
      </Routes>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#0A0A12',
            border: '1px solid #1A1A2E',
            color: '#E8ECF1',
            fontFamily: 'monospace',
            fontSize: '12px',
          },
        }}
      />
    </HashRouter>
  );
}

export default App;