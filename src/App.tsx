import { MotionConfig } from 'framer-motion';
import { useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Footer } from './components/layout/Footer';
import { Header } from './components/layout/Header';
import { RouteRail } from './components/layout/RouteRail';
import { MoveProvider } from './context/MoveContext';
import { startSmoothScroll } from './lib/scroll';
import { HomePage } from './pages/HomePage';
import { LegalPage } from './pages/LegalPage';

export default function App() {
  useEffect(() => startSmoothScroll(), []);

  return (
    <MotionConfig reducedMotion="user">
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <MoveProvider>
          <Header />
          <RouteRail />
          <main id="main">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/privacy" element={<LegalPage kind="privacy" />} />
              <Route path="/terms" element={<LegalPage kind="terms" />} />
              <Route path="*" element={<LegalPage kind="not-found" />} />
            </Routes>
          </main>
          <Footer />
        </MoveProvider>
      </BrowserRouter>
    </MotionConfig>
  );
}
