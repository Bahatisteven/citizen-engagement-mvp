import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Submit from './pages/Submit';
import Status from './pages/Status';
import Admin from './pages/Admin';

const App = () => (
  <BrowserRouter>
    <nav>
      <ul>
        <li><Link to="/submit">Submit Complaint</Link></li>
        <li><Link to="/status">Check Status</Link></li>
        <li><Link to="/admin">Admin Panel</Link></li>
      </ul>
    </nav>
    <Routes>
      <Route path="/submit" element={<Submit />} />
      <Route path="/status" element={<Status />} />
      <Route path="/admin" element={<Admin />} />
    </Routes>
  </BrowserRouter>
);

export default App;