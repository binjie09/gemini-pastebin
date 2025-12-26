import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './i18n';
import Home from './pages/Home';
import PasteView from './pages/PasteView';
import LanguageSwitcher from './components/LanguageSwitcher';
import { NotificationProvider } from './context/NotificationContext';

function App() {
  return (
    <Router>
      <NotificationProvider>
        <div className="container">
          <header style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Link to="/" style={{ textDecoration: 'none' }}>
              <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, background: 'linear-gradient(90deg, #2f81f7, #2f81f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                CBJ Tools <span style={{ color: '#fff', WebkitTextFillColor: 'initial' }}>Pastbin</span>
              </h1>
            </Link>
            <LanguageSwitcher />
          </header>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/:id" element={<PasteView />} />
          </Routes>
        </div>
      </NotificationProvider>
    </Router>
  );
}

export default App;
