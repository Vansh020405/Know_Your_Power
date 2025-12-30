import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './components/Home';
import AuthorityChecker from './components/AuthorityChecker';
import EligibilityChecker from './components/EligibilityChecker';
import ContractDecoder from './components/ContractDecoder';
import ConversationScripts from './components/ConversationScripts';
import About from './components/About';
import Privacy from './components/Privacy';
import Contacts from './components/Contacts.jsx';
import Login from './components/Login';
import Signup from './components/Signup';
import Profile from './components/Profile';
import SavedSituations from './components/SavedSituations';
import Settings from './components/Settings';
import { AuthProvider } from './context/AuthContext';
import { PreferencesProvider } from './context/PreferencesContext';
import { useState, useEffect } from 'react';

const PageWrapper = ({ children }) => {
  const [isPageReady, setIsPageReady] = useState(false);

  useEffect(() => {
    setIsPageReady(false);
    const timer = setTimeout(() => {
      setIsPageReady(true);
    }, 450); // Mandatory 300-500ms delay
    return () => clearTimeout(timer);
  }, [window.location.pathname]); // Re-run on route change

  if (!isPageReady) {
    return (
      <div className="page-loading-overlay">
        <div className="skeleton-card shimmer"></div>
        <div className="skeleton-text shimmer"></div>
        <div className="skeleton-text short shimmer"></div>
      </div>
    );
  }

  return <div className="fade-in-content">{children}</div>;
};

function App() {
  return (
    <AuthProvider>
      <PreferencesProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<PageWrapper><Home /></PageWrapper>} />
              <Route path="authority" element={<PageWrapper><AuthorityChecker /></PageWrapper>} />
              <Route path="eligibility" element={<PageWrapper><EligibilityChecker /></PageWrapper>} />
              <Route path="decoder" element={<PageWrapper><ContractDecoder /></PageWrapper>} />
              <Route path="scripts" element={<PageWrapper><ConversationScripts /></PageWrapper>} />
              <Route path="about" element={<PageWrapper><About /></PageWrapper>} />
              <Route path="privacy" element={<PageWrapper><Privacy /></PageWrapper>} />
              <Route path="contacts" element={<PageWrapper><Contacts /></PageWrapper>} />

              {/* Auth Routes */}
              <Route path="login" element={<PageWrapper><Login /></PageWrapper>} />
              <Route path="signup" element={<PageWrapper><Signup /></PageWrapper>} />
              <Route path="profile" element={<PageWrapper><Profile /></PageWrapper>} />
              <Route path="saved" element={<PageWrapper><SavedSituations /></PageWrapper>} />
              <Route path="settings" element={<PageWrapper><Settings /></PageWrapper>} />
            </Route>
          </Routes>
        </BrowserRouter>
      </PreferencesProvider>
    </AuthProvider>
  );
}

export default App;
