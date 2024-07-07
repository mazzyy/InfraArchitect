// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import CreatePipeline from './pages/Createpipeline';

function App() {
    return (
        <Router>
            <div className="App">
                <Navbar />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/create-pipeline" element={<CreatePipeline />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
