
import { useState, useEffect } from 'react';

import { useNavigate } from 'react-router-dom';

import './Dashboard.css';

function Dashboard() {

    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem('user') || 'null');

    const [journeys, setJourneys] = useState([]);
    const [loading, setLoading] = useState(true);
    const [journeyError, setJourneyError] = useState('');

    // Fetch journeys when Dashboard loads
    useEffect(() => {

        let ignore = false;

        if (!user?.id) {
            navigate('/login');

            return () => {
                ignore = true;
            };
        }

        const loadJourneys = async () => {

            try {

                const response = await fetch(
                    `http://localhost:8081/api/journeys/user/${user.id}`
                );

                if (!response.ok) {
                    throw new Error('Unable to load journey details');
                }

                const data = await response.json();

                if (!ignore) {
                    setJourneys(data);
                    setJourneyError('');
                }

            } catch (error) {

                console.error('Dashboard Journey Error:', error);

                if (!ignore) {
                    setJourneyError(
                        'Unable to load your journeys right now.'
                    );
                }

            } finally {

                if (!ignore) {
                    setLoading(false);
                }

            }

        };

        loadJourneys();

        return () => {
            ignore = true;
        };

    }, [user?.id, navigate]);

    // Today's date
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    // Filter upcoming journeys
    const upcomingJourneys = journeys

        .filter((journey) => {

            if (!journey.travelDate) return false;

            const date = new Date(
                `${journey.travelDate}T00:00:00`
            );

            return !isNaN(date.getTime()) && date >= today;

        })

        .sort((a, b) =>

            new Date(`${a.travelDate}T00:00:00`) -
            new Date(`${b.travelDate}T00:00:00`)

        );

    const nextJourney = upcomingJourneys[0];

    // Count unique travel modes
    const travelModes = new Set(

        journeys
            .map((journey) => journey.travelType)
            .filter(Boolean)

    ).size;

    // Format date
    const formatDate = (date) => {

        if (!date) return 'Not available';

        return new Date(
            `${date}T00:00:00`
        ).toLocaleDateString('en-IN', {

            day: 'numeric',
            month: 'long',
            year: 'numeric'

        });

    };

    // Logout
    const handleLogout = () => {

        localStorage.removeItem('user');

        navigate('/login');

    };

    return (

        <div className="dashboard-page">

            {/* Navbar */}

            <nav className="dashboard-navbar">

                <h2>
                    Safe<span>Route</span>
                </h2>

                <div className="dashboard-nav-actions">

                    <button onClick={() => navigate('/')}>
                        Home
                    </button>

                    <button onClick={handleLogout}>
                        Logout
                    </button>

                </div>

            </nav>

            <main className="dashboard-content">

                {/* Welcome Section */}

                <section className="dashboard-welcome">

                    <div>

                        <p className="dashboard-label">
                            YOUR PERSONAL TRAVEL SPACE
                        </p>

                        <h1>
                            Welcome back, {user?.fullName || 'User'}!
                        </h1>

                        <p>
                            Your journey. Your safety. Your peace of mind.
                        </p>

                    </div>

                    <button
                        className="plan-journey-btn"
                        onClick={() => navigate('/journeys')}
                    >
                        + Plan a Journey
                    </button>

                </section>

                {/* Statistics */}

                <section className="dashboard-stats">

                    <div className="stat-card">

                        <div className="stat-icon">01</div>

                        <div>
                            <h2>
                                {loading ? '...' : journeys.length}
                            </h2>

                            <p>Total Journeys</p>
                        </div>

                    </div>

                    <div className="stat-card">

                        <div className="stat-icon">02</div>

                        <div>
                            <h2>
                                {loading ? '...' : upcomingJourneys.length}
                            </h2>

                            <p>Upcoming Journeys</p>
                        </div>

                    </div>

                    <div className="stat-card">

                        <div className="stat-icon">03</div>

                        <div>
                            <h2>
                                {loading ? '...' : travelModes}
                            </h2>

                            <p>Travel Modes Used</p>
                        </div>

                    </div>

                </section>

                {/* Quick Actions */}

                <section className="dashboard-section">

                    <div className="dashboard-section-heading">

                        <h2>Quick Actions</h2>

                        <p>
                            Everything you need for your journey.
                        </p>

                    </div>

                    <div className="dashboard-cards">

                        {/* My Profile */}

                        <button
                            className="dashboard-card"
                            onClick={() => navigate('/profile')}
                        >

                            <div className="action-icon">P</div>

                            <h3>My Profile</h3>

                            <p>
                                View and manage your account details.
                            </p>

                            <span>View Profile →</span>

                        </button>

                        {/* My Journeys */}

                        <button
                            className="dashboard-card"
                            onClick={() => navigate('/journeys')}
                        >

                            <div className="action-icon">J</div>

                            <h3>My Journeys</h3>

                            <p>
                                Plan, view and manage your travel activities.
                            </p>

                            <span>View Journeys →</span>

                        </button>

                        {/* Emergency Contacts */}

                        <button
                            className="dashboard-card"
                            onClick={() => navigate('/emergency-contacts')}
                        >

                            <div className="action-icon">E</div>

                            <h3>Emergency Contacts</h3>

                            <p>
                                Add and manage your trusted emergency contacts.
                            </p>

                            <span>Manage Contacts →</span>

                        </button>

                        {/* SOS Emergency */}

                        <button
                            className="dashboard-card"
                            onClick={() => navigate('/sos')}
                        >

                            <div className="action-icon">SOS</div>

                            <h3>SOS Emergency</h3>

                            <p>
                                Create, track and manage emergency alerts.
                            </p>

                            <span>Open SOS Centre →</span>

                        </button>

                        {/* Safety Centre */}

                        <button
                            className="dashboard-card"
                            onClick={() => navigate('/safety-centre')}
                        >

                            <div className="action-icon">S</div>

                            <h3>Safety Centre</h3>

                            <p>
                                Explore safety information and travel
                                preparation tips.
                            </p>

                            <span>Explore Safety Centre →</span>

                        </button>

                    </div>

                </section>

                {/* Upcoming Journey */}

                <section className="dashboard-section">

                    <div className="dashboard-section-heading">

                        <h2>Upcoming Journey</h2>

                        <p>Your next planned trip.</p>

                    </div>

                    <div className="upcoming-journey">

                        {loading ? (

                            <p>Loading your journeys...</p>

                        ) : journeyError ? (

                            <p>{journeyError}</p>

                        ) : nextJourney ? (

                            <>

                                <div className="upcoming-header">

                                    <div>

                                        <span className="journey-status">
                                            UPCOMING
                                        </span>

                                        <h3>{nextJourney.title}</h3>

                                    </div>

                                    <button
                                        onClick={() => navigate('/journeys')}
                                    >
                                        View All
                                    </button>

                                </div>

                                <div className="journey-route">

                                    <div>

                                        <span>FROM</span>

                                        <h3>{nextJourney.source}</h3>

                                    </div>

                                    <div
                                        className="route-line"
                                        aria-hidden="true"
                                    >
                                        <i></i>
                                    </div>

                                    <div>

                                        <span>TO</span>

                                        <h3>{nextJourney.destination}</h3>

                                    </div>

                                </div>

                                <div className="journey-details">

                                    <p>
                                        <strong>Date:</strong>{' '}
                                        {formatDate(nextJourney.travelDate)}
                                    </p>

                                    <p>
                                        <strong>Time:</strong>{' '}
                                        {nextJourney.travelTime || 'Not available'}
                                    </p>

                                    <p>
                                        <strong>Travel Type:</strong>{' '}
                                        {nextJourney.travelType || 'Not available'}
                                    </p>

                                </div>

                            </>

                        ) : (

                            <div className="no-upcoming-journey">

                                <h3>No Upcoming Journeys</h3>

                                <p>
                                    Start planning your next trip with SafeRoute.
                                </p>

                                <button
                                    onClick={() => navigate('/journeys')}
                                >
                                    Plan Your First Journey
                                </button>

                            </div>

                        )}

                    </div>

                </section>

                {/* Safety Tips */}

                <section className="safety-tips">

                    <div>

                        <p className="dashboard-label">
                            TRAVEL SMART
                        </p>

                        <h2>
                            A little preparation goes a long way.
                        </h2>

                        <p>
                            Keep your travel details ready, inform trusted
                            contacts about your plans and stay aware
                            throughout your journey.
                        </p>

                    </div>

                    <div className="safety-tip-number">
                        SAFE<br />TRAVEL
                    </div>

                </section>

            </main>

            {/* Footer */}

            <footer className="dashboard-footer">

                <h3>
                    Safe<span>Route</span>
                </h3>

                <p>Travel Smart. Stay Safe.</p>

                <p>© 2026 SafeRoute. All rights reserved.</p>

            </footer>

        </div>

    );

}

export default Dashboard;
