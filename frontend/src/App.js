// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ConfigForm from './components/ConfigForm';
import Home from './pages/Home';
import Navbar from './components/Navbar';


function App() {
    return (
      <Router>
            <Navbar />
            <div className="App">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/cicd" element={<ConfigForm />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
