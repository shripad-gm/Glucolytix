// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';

import Register from './pages/register';
import Login from './pages/login';
import Home from './pages/home';
import Contact from './pages/contact';
import About from './pages/about';
import DashboardPage from './pages/dashboard';

import PrivateRoute from './components/PrivateRoute'; // we'll create this
import DiabetesForm from './pages/form';
import ReportPage from './pages/report';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<About />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/form" element={<DiabetesForm/>} />
        <Route path="/report" element={<ReportPage/>} />

        {/* PROTECTED ROUTE */}
        <Route
          path="/home"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />

        {/* fallback */}
        <Route path="/" element={<Register />} />
      </Routes>
    </Router>
  );
};

export default App;
