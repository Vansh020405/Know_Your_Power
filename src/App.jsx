import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './components/Home';
import AuthorityChecker from './components/AuthorityChecker';
import EligibilityChecker from './components/EligibilityChecker';
import ContractDecoder from './components/ContractDecoder';
import About from './components/About';
import Support from './components/Support';
import Contacts from './components/Contacts.jsx';
import Login from './components/Login';
import Signup from './components/Signup';
import Profile from './components/Profile';
import { AuthProvider } from './context/AuthContext';
import { PreferencesProvider } from './context/PreferencesContext';

function App() {
  return (
    <AuthProvider>
      <PreferencesProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="authority" element={<AuthorityChecker />} />
              <Route path="eligibility" element={<EligibilityChecker />} />
              <Route path="decoder" element={<ContractDecoder />} />
              <Route path="about" element={<About />} />
              <Route path="support" element={<Support />} />
              <Route path="contacts" element={<Contacts />} />

              {/* Auth Routes */}
              <Route path="login" element={<Login />} />
              <Route path="signup" element={<Signup />} />
              <Route path="profile" element={<Profile />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </PreferencesProvider>
    </AuthProvider>
  );
}

export default App;
