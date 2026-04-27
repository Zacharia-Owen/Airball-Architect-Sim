import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import Home from '.pages/Home';
import Teams from './pages/Teams';
import Roster from './pages/Roster';

function App() {
    return (
        <Router>
            <div className="App">
                <header className="header">
                    <h1>Airball Architect Sim</h1>
                    <p className="subtitle">Basketball Game Simulator</p>
                    <nav className="nav">
                        <Link to="/" className="nav-link">Simulate</Link>
                        <Link to="/teams" className="nav-link">Teams</Link>
                    </nav>
                </header>

                <main>
                    <Routes>
                        <Route path="/" element={Home />} />
                        <Route path="/teams" element={Teams />} />
                        <Route path="/teams/:teamId" element={Roster />} />

                    </Routes>
                </main>
            </div>
        </Router>
    )
}

export default App;