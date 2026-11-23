
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import JourneyMap from '../components/JourneyMap';
import './Journey.css';

function formatDateTime(dateTime) {
    if (!dateTime) return 'Not available';

    const date = new Date(dateTime);

    if (Number.isNaN(date.getTime())) {
        return 'Not available';
    }

    return date.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function Journey() {
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const userId = user?.id;

    const [showForm, setShowForm] = useState(false);
    const [journeys, setJourneys] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [updatingId, setUpdatingId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [editingJourney, setEditingJourney] = useState(null);
    const [notice, setNotice] = useState('');

    const [title, setTitle] = useState('');
    const [source, setSource] = useState('');
    const [destination, setDestination] = useState('');
    const [travelDate, setTravelDate] = useState('');
    const [travelTime, setTravelTime] = useState('');
    const [travelType, setTravelType] = useState('');

    // Store calculated route information
    const [routeDetails, setRouteDetails] = useState(null);

    // Receive route details from JourneyMap
    const handleRouteCalculated = (details) => {
        console.log('Route details received in Journey.jsx:', details);
        setRouteDetails(details);
    };

    // Fetch journeys
    const fetchJourneys = useCallback(async () => {
        if (!userId) {
            navigate('/login');
            return;
        }

        try {
            const response = await fetch(
                `http://localhost:8081/api/journeys/user/${userId}`
            );

            if (!response.ok) {
                throw new Error('Unable to load journeys');
            }

            const data = await response.json();

            setJourneys(data);

            console.log('Fetched journeys:', data);

        } catch (error) {
            console.error('Journey Fetch Error:', error);
            setNotice(error.message);
        }
    }, [userId, navigate]);

    // Initial loading
    useEffect(() => {
        const loadJourneys = async () => {
            try {
                await fetchJourneys();
            } finally {
                setLoading(false);
            }
        };

        loadJourneys();
    }, [fetchJourneys]);

    // Reset form
    const resetForm = () => {
        setTitle('');
        setSource('');
        setDestination('');
        setTravelDate('');
        setTravelTime('');
        setTravelType('');
        setRouteDetails(null);
        setEditingJourney(null);
        setShowForm(false);
    };

    // Add new journey
    const handleNewJourney = () => {
        resetForm();
        setNotice('');
        setShowForm(true);
    };

    // Edit journey
    const handleEditJourney = (journey) => {
        setEditingJourney(journey);

        setTitle(journey.title || '');
        setSource(journey.source || '');
        setDestination(journey.destination || '');
        setTravelDate(journey.travelDate || '');
        setTravelTime(journey.travelTime || '');
        setTravelType(journey.travelType || '');

        if (journey.routeGeometry) {
            setRouteDetails({
                sourceLatitude: journey.sourceLatitude,
                sourceLongitude: journey.sourceLongitude,
                destinationLatitude: journey.destinationLatitude,
                destinationLongitude: journey.destinationLongitude,
                distanceKm: journey.distanceKm,
                estimatedDurationMinutes: journey.estimatedDurationMinutes,
                routeGeometry: journey.routeGeometry
            });
        } else {
            setRouteDetails(null);
        }

        setNotice('');
        setShowForm(true);

        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    // Add or update journey
    const handleSaveJourney = async (event) => {
        event.preventDefault();

        if (!userId) {
            navigate('/login');
            return;
        }

        if (!title.trim() || !source.trim() || !destination.trim()) {
            setNotice('Please enter all required journey details.');
            return;
        }

        const journeyData = {
            userId,
            title: title.trim(),
            source: source.trim(),
            destination: destination.trim(),
            travelDate,
            travelTime,
            travelType,
            ...(routeDetails || {})
        };

        console.log('Journey data being sent to backend:', journeyData);
        console.log('Route details before saving:', routeDetails);

        try {
            setSaving(true);
            setNotice('');

            const isEditing = editingJourney !== null;

            const url = isEditing
                ? `http://localhost:8081/api/journeys/${editingJourney.id}`
                : 'http://localhost:8081/api/journeys';

            const response = await fetch(url, {
                method: isEditing ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(journeyData)
            });

            const responseText = await response.text();

            console.log('Backend response status:', response.status);
            console.log('Backend response body:', responseText);

            if (!response.ok) {
                throw new Error(responseText || 'Failed to save journey');
            }

            await fetchJourneys();

            resetForm();

            setNotice(
                isEditing
                    ? 'Journey updated successfully.'
                    : 'Journey added successfully.'
            );

        } catch (error) {
            console.error('Journey Save Error:', error);
            setNotice(error.message);

        } finally {
            setSaving(false);
        }
    };

    // Delete journey
    const handleDeleteJourney = async (journeyId) => {
        if (!window.confirm('Are you sure you want to delete this journey?')) {
            return;
        }

        try {
            setDeletingId(journeyId);

            const response = await fetch(
                `http://localhost:8081/api/journeys/${journeyId}`,
                {
                    method: 'DELETE'
                }
            );

            if (!response.ok) {
                throw new Error('Failed to delete journey');
            }

            await fetchJourneys();

            setNotice('Journey deleted successfully.');

        } catch (error) {
            console.error('Journey Delete Error:', error);
            setNotice(error.message);

        } finally {
            setDeletingId(null);
        }
    };

    // Start journey
    const handleStartJourney = async (journeyId) => {
        if (!window.confirm('Are you ready to start this journey?')) {
            return;
        }

        try {
            setUpdatingId(journeyId);

            const response = await fetch(
                `http://localhost:8081/api/journeys/${journeyId}/start`,
                {
                    method: 'PATCH'
                }
            );

            if (!response.ok) {
                throw new Error('Unable to start journey');
            }

            await response.json();
            await fetchJourneys();

            setNotice('Your journey has started.');

        } catch (error) {
            console.error('Start Journey Error:', error);
            setNotice(error.message);

        } finally {
            setUpdatingId(null);
        }
    };

    // Confirm safe arrival
    const handleCompleteJourney = async (journeyId) => {
        if (!window.confirm('Have you safely reached your destination?')) {
            return;
        }

        try {
            setUpdatingId(journeyId);

            const response = await fetch(
                `http://localhost:8081/api/journeys/${journeyId}/complete`,
                {
                    method: 'PATCH'
                }
            );

            if (!response.ok) {
                throw new Error('Unable to complete journey');
            }

            await response.json();
            await fetchJourneys();

            setNotice('Safe arrival confirmed successfully.');

        } catch (error) {
            console.error('Complete Journey Error:', error);
            setNotice(error.message);

        } finally {
            setUpdatingId(null);
        }
    };

	const handleShareJourney = async (journey) => {

	    const mapLink = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(journey.source)}&destination=${encodeURIComponent(journey.destination)}`;

	    const message = `
	SafeRoute - Journey Details

	Journey: ${journey.title}

	Starting Location: ${journey.source}

	Destination: ${journey.destination}

	Travel Date: ${journey.travelDate}

	Travel Time: ${journey.travelTime}

	Travel Type: ${journey.travelType}

	Estimated Distance: ${journey.distanceKm ?? 'Not available'} km

	Estimated Duration: ${journey.estimatedDurationMinutes ?? 'Not available'} minutes

	Journey Status: ${journey.status || 'PLANNED'}

	Google Maps Directions:
	${mapLink}

	Shared using SafeRoute.
	    `.trim();

	    try {

	        if (navigator.share) {

	            await navigator.share({
	                title: 'SafeRoute - Journey Details',
	                text: message
	            });

	        } else {

	            const whatsappUrl =
	                `https://wa.me/?text=${encodeURIComponent(message)}`;

	            window.open(whatsappUrl, '_blank');

	        }

	    } catch (error) {

	        if (error.name !== 'AbortError') {
	            console.error('Journey sharing error:', error);
	            setNotice('Unable to share journey details.');
	        }

	    }
	};


    // Status badge
    const getStatusClass = (status) => {
        switch (status) {
            case 'IN_PROGRESS':
                return 'in-progress';
            case 'COMPLETED':
                return 'completed';
            default:
                return 'planned';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'IN_PROGRESS':
                return 'IN PROGRESS';
            case 'COMPLETED':
                return 'COMPLETED';
            default:
                return 'PLANNED';
        }
    };

    return (
        <div className="journey-page">

            <nav className="journey-navbar">
                <h2>
                    Safe<span>Route</span>
                </h2>

                <button
                    type="button"
                    onClick={() => navigate('/dashboard')}
                >
                    Back to Dashboard
                </button>
            </nav>

            <div className="journey-content">

                <h1>My Journeys</h1>

                <p>
                    Plan and manage your journeys with confidence.
                </p>

                <button
                    type="button"
                    className="add-journey-btn"
                    onClick={handleNewJourney}
                >
                    + Add New Journey
                </button>

                {notice && (
                    <div className="journey-notice">
                        {notice}
                    </div>
                )}

                {/* Add / Edit Form */}
                {showForm && (
                    <div className="journey-form-card">

                        <h2>
                            {editingJourney
                                ? 'Edit Journey'
                                : 'Plan a New Journey'}
                        </h2>

                        <form onSubmit={handleSaveJourney}>

                            <div className="journey-form-group">
                                <label>Journey Title</label>

                                <input
                                    type="text"
                                    placeholder="Example: Weekend Trip"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="journey-form-group">
                                <label>Starting Location</label>

                                <input
                                    type="text"
                                    placeholder="Enter starting location"
                                    value={source}
                                    onChange={(e) => {
                                        setSource(e.target.value);
                                        setRouteDetails(null);
                                    }}
                                    required
                                />
                            </div>

                            <div className="journey-form-group">
                                <label>Destination</label>

                                <input
                                    type="text"
                                    placeholder="Enter destination"
                                    value={destination}
                                    onChange={(e) => {
                                        setDestination(e.target.value);
                                        setRouteDetails(null);
                                    }}
                                    required
                                />
                            </div>

                            {/* Interactive Journey Map */}
                            <JourneyMap
                                source={source}
                                destination={destination}
                                travelType={travelType}
                                onRouteCalculated={handleRouteCalculated}
                            />

                            <div className="journey-form-row">

                                <div className="journey-form-group">
                                    <label>Travel Date</label>

                                    <input
                                        type="date"
                                        value={travelDate}
                                        onChange={(e) => setTravelDate(e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                        required
                                    />
                                </div>

                                <div className="journey-form-group">
                                    <label>Travel Time</label>

                                    <input
                                        type="time"
                                        value={travelTime}
                                        onChange={(e) => setTravelTime(e.target.value)}
                                        required
                                    />
                                </div>

                            </div>

                            <div className="journey-form-group">
                                <label>Travel Type</label>

                                <select
                                    value={travelType}
                                    onChange={(e) => {
                                        setTravelType(e.target.value);
                                    }}
                                    required
                                >
                                    <option value="">Select travel type</option>
                                    <option value="Car">Car</option>
                                    <option value="Bus">Bus</option>
                                    <option value="Train">Train</option>
                                    <option value="Flight">Flight</option>
                                </select>
                            </div>

                            <div className="journey-form-actions">

                                <button
                                    type="button"
                                    className="cancel-journey-btn"
                                    onClick={resetForm}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="save-journey-btn"
                                    disabled={saving}
                                >
                                    {saving
                                        ? 'Saving...'
                                        : editingJourney
                                            ? 'Update Journey'
                                            : 'Save Journey'}
                                </button>

                            </div>

                        </form>
                    </div>
                )}

                {/* Journey List */}
                <div className="journey-list">

                    {loading ? (
                        <p>Loading journeys...</p>
                    ) : journeys.length === 0 ? (
                        <div className="journey-empty">
                            <h2>No Journeys Yet</h2>
                            <p>Your planned journeys will appear here.</p>
                        </div>
                    ) : (
                        journeys.map((journey) => {
                            const status = journey.status || 'PLANNED';

                            return (
                                <div
                                    className="journey-card"
                                    key={journey.id}
                                >

                                    <div className="journey-card-header">
                                        <h2>{journey.title}</h2>

                                        <span
                                            className={`journey-status-badge ${getStatusClass(status)}`}
                                        >
                                            {getStatusLabel(status)}
                                        </span>
                                    </div>

                                    <p>
                                        <strong>From:</strong> {journey.source}
                                    </p>

                                    <p>
                                        <strong>To:</strong> {journey.destination}
                                    </p>

                                    <p>
                                        <strong>Date:</strong> {journey.travelDate}
                                    </p>

                                    <p>
                                        <strong>Time:</strong> {journey.travelTime}
                                    </p>

                                    <p>
                                        <strong>Travel Type:</strong> {journey.travelType}
                                    </p>

                                    {journey.distanceKm != null && (
                                        <p>
                                            <strong>Route Distance:</strong> {journey.distanceKm} km
                                        </p>
                                    )}

                                    {journey.estimatedDurationMinutes != null && (
                                        <p>
                                            <strong>Estimated Duration:</strong>{' '}
                                            {journey.estimatedDurationMinutes} minutes
                                        </p>
                                    )}

                                    {journey.startedAt && (
                                        <div className="journey-timestamp">
                                            <strong>Journey Started:</strong>
                                            <span>
                                                {formatDateTime(journey.startedAt)}
                                            </span>
                                        </div>
                                    )}

                                    {journey.completedAt && (
                                        <div className="journey-timestamp arrival-time">
                                            <strong>Safe Arrival:</strong>
                                            <span>
                                                {formatDateTime(journey.completedAt)}
                                            </span>
                                        </div>
                                    )}

                                    <div className="journey-card-actions">
									<button
									    type="button"
									    className="share-journey-btn"
									    onClick={() => handleShareJourney(journey)}
									>
									    Share Journey
									</button>

                                        {status === 'PLANNED' && (
                                            <button
                                                type="button"
                                                className="start-journey-btn"
                                                onClick={() => handleStartJourney(journey.id)}
                                                disabled={updatingId === journey.id}
                                            >
                                                {updatingId === journey.id
                                                    ? 'Please wait...'
                                                    : 'Start Journey'}
                                            </button>
                                        )}

                                        {status === 'IN_PROGRESS' && (
                                            <button
                                                type="button"
                                                className="complete-journey-btn"
                                                onClick={() => handleCompleteJourney(journey.id)}
                                                disabled={updatingId === journey.id}
                                            >
                                                {updatingId === journey.id
                                                    ? 'Please wait...'
                                                    : 'Confirm Safe Arrival'}
                                            </button>
                                        )}

                                        {status === 'PLANNED' && (
                                            <button
                                                type="button"
                                                className="edit-journey-btn"
                                                onClick={() => handleEditJourney(journey)}
                                            >
                                                Edit Journey
                                            </button>
                                        )}

                                        <button
                                            type="button"
                                            className="delete-journey-btn"
                                            onClick={() => handleDeleteJourney(journey.id)}
                                            disabled={deletingId === journey.id}
                                        >
                                            {deletingId === journey.id
                                                ? 'Deleting...'
                                                : 'Delete Journey'}
                                        </button>

                                    </div>

                                    {status === 'COMPLETED' && (
                                        <p className="safe-arrival-message">
                                            Safe arrival confirmed successfully.
                                        </p>
                                    )}

                                </div>
                            );
                        })
                    )}

                </div>

            </div>
        </div>
    );
}

export default Journey;
