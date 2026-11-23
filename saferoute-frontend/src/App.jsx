
import { useState, useEffect } from 'react';

import { Routes, Route, Link, Navigate } from 'react-router-dom';

import WelcomeScreen from './components/WelcomeScreen';

import Login from './pages/Login';
import Register from './pages/Register';
import SOSAlerts from './pages/SOSAlerts';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Journey from './pages/Journey';
import EmergencyContacts from './pages/EmergencyContacts';
import SafetyCentre from './pages/SafetyCentre';
import SOS from "./pages/SOS";
import { checkBackendHealth } from './services/healthService';

import './App.css';

function HomePage({ backendStatus, backendMessage }) {

    return (
        <div className="app">

            <nav className="navbar">

                <div className="logo">
                    Safe<span>Route</span>
                </div>

                <div className="nav-links">
                    <a href="#home">Home</a>
                    <a href="#features">Features</a>
                    <a href="#about">About</a>
                </div>

                <div className="nav-buttons">

                    <Link to="/login" className="login-btn">
                        Login
                    </Link>

                    <Link to="/register" className="register-btn">
                        Register
                    </Link>

                </div>

            </nav>

            <section className="hero" id="home">

                <div className="hero-content">

                    <p className="welcome-text">
                        YOUR JOURNEY, YOUR SAFETY
                    </p>

                    <h1>
                        Travel Smart.<br />
                        Stay <span>Safe.</span>
                    </h1>

                    <p className="hero-description">
                        Plan your journeys, stay connected with your
                        loved ones and travel with greater confidence.
                        Your safety companion for every journey.
                    </p>

                    <div className="hero-buttons">

                        <Link to="/login" className="primary-btn">
                            Plan Your Journey
                        </Link>

                        <a href="#features" className="secondary-btn">
                            Explore Features
                        </a>

                    </div>

                </div>

                <div className="hero-card">

                    <div className="shield">✓</div>

                    <h2>Your Safety Matters</h2>

                    <p>
                        Every journey deserves a safer experience.
                    </p>

                    <div className="safety-status">

                        <span
                            className="status-dot"
                            style={{
                                backgroundColor:
                                    backendStatus === 'UP' ? '#789B75' :
                                    backendStatus === 'DOWN' ? '#C65353' :
                                    '#B77B83'
                            }}
                        ></span>

                        {backendStatus === 'UP'
                            ? 'Backend Connected'
                            : backendStatus === 'DOWN'
                            ? 'Backend Disconnected'
                            : 'Checking Backend...'}

                    </div>

                    <p style={{ marginTop: '12px', fontSize: '12px' }}>
                        {backendMessage}
                    </p>

                </div>

            </section>

            <section className="features" id="features">

                <div className="section-heading">

                    <p>WHAT WE OFFER</p>

                    <h2>Travel with Confidence</h2>

                    <span>
                        Everything you need for a safer journey
                        in one place.
                    </span>

                </div>

                <div className="feature-container">

                    <div className="feature-card">
                        <div className="feature-icon">01</div>
                        <h3>Journey Planning</h3>
                        <p>
                            Plan your trips and organize your
                            travel information easily.
                        </p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">02</div>
                        <h3>Live Journey Sharing</h3>
                        <p>
                            Share your journey details with
                            trusted contacts.
                        </p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">03</div>
                        <h3>Emergency SOS</h3>
                        <p>
                            Access emergency assistance
                            information when needed.
                        </p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">04</div>
                        <h3>Safety Check-in</h3>
                        <p>
                            Confirm your safe arrival and
                            manage journey check-ins.
                        </p>
                    </div>

                </div>

            </section>

            <section className="about" id="about">

                <h2>About SafeRoute</h2>

                <p>
                    SafeRoute is a smart travel and safety companion
                    designed to help people plan journeys, manage
                    travel details and stay connected with trusted
                    contacts.
                </p>

            </section>

            <footer className="footer">

                <h3>SafeRoute</h3>
                <p>Travel Smart. Stay Safe.</p>
                <p>© 2026 SafeRoute. All rights reserved.</p>

            </footer>

        </div>
    );
}

function ProtectedRoute({ children }) {

    const user = localStorage.getItem('user');

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

function App() {

    const [showWelcome, setShowWelcome] = useState(true);

    const [backendStatus, setBackendStatus] = useState('CHECKING');

    const [backendMessage, setBackendMessage] = useState(
        'Connecting to server...'
    );

    useEffect(() => {

        const connectBackend = async () => {

            try {

                const data = await checkBackendHealth();

                setBackendStatus(data.status);
                setBackendMessage(data.message);

            } catch (error) {

                console.error('Backend error:', error);

                setBackendStatus('DOWN');
                setBackendMessage('Backend connection failed');

            }

        };

        connectBackend();

    }, []);

    if (showWelcome) {

        return (
            <WelcomeScreen
                onEnter={() => setShowWelcome(false)}
            />
        );

    }

    return (

        <Routes>

            <Route
                path="/"
                element={
                    <HomePage
                        backendStatus={backendStatus}
                        backendMessage={backendMessage}
                    />
                }
            />

            <Route
                path="/login"
                element={<Login />}
            />

            <Route
                path="/register"
                element={<Register />}
            />

            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/profile"
                element={
                    <ProtectedRoute>
                        <Profile />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/journeys"
                element={
                    <ProtectedRoute>
                        <Journey />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/emergency-contacts"
                element={
                    <ProtectedRoute>
                        <EmergencyContacts />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/sos"
                element={
                    <ProtectedRoute>
                        <SOSAlerts />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/safety-centre"
                element={
                    <ProtectedRoute>
                        <SafetyCentre />
                    </ProtectedRoute>
                }
            />
			<Route path="/sos" element={<SOS />} />

            <Route
                path="*"
                element={<Navigate to="/" replace />}
            />

        </Routes>

    );
}

export default App;
