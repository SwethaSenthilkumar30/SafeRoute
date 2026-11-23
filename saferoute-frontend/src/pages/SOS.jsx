
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './SOS.css';

const API = 'http://localhost:8081/api/sos';

function SOS() {

    const navigate = useNavigate();

    const user = JSON.parse(
        localStorage.getItem('user') || 'null'
    );

    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [gettingLocation, setGettingLocation] = useState(false);

    const emptyForm = {
        latitude: '',
        longitude: '',
        locationAddress: '',
        message: ''
    };

    const [form, setForm] = useState(emptyForm);

    // Load SOS alerts
    const loadAlerts = useCallback(async () => {

        if (!user?.id) return;

        try {

            setLoading(true);

            const response = await fetch(
                `${API}/user/${user.id}`
            );

            if (!response.ok) {
                throw new Error('Unable to load SOS alerts.');
            }

            const data = await response.json();

            setAlerts(data);
            setError('');

        } catch (err) {

            console.error('SOS Error:', err);
            setError(err.message);

        } finally {

            setLoading(false);

        }

    }, [user?.id]);

    // Redirect if user is not logged in

	useEffect(() => {
	    if (!user?.id) {
	        navigate('/login');
	        return;
	    }

	    let cancelled = false;

	    const fetchInitialAlerts = async () => {
	        try {
	            const response = await fetch(
	                `${API}/user/${user.id}`
	            );

	            if (!response.ok) {
	                throw new Error('Unable to load SOS alerts.');
	            }

	            const data = await response.json();

	            if (!cancelled) {
	                setAlerts(data);
	                setError('');
	            }

	        } catch (err) {
	            console.error('SOS Error:', err);

	            if (!cancelled) {
	                setError(err.message);
	            }

	        } finally {
	            if (!cancelled) {
	                setLoading(false);
	            }
	        }
	    };

	    fetchInitialAlerts();

	    return () => {
	        cancelled = true;
	    };

	}, [user?.id, navigate]);

    // Handle form changes
    const handleChange = (e) => {

        const { name, value } = e.target;

        setForm(prev => ({
            ...prev,
            [name]: value
        }));

    };

    // Capture GPS location
    const captureLocation = () => {

        if (!navigator.geolocation) {

            setError('Geolocation is not supported by your browser.');
            return;

        }

        setGettingLocation(true);
        setError('');
        setSuccess('');

        navigator.geolocation.getCurrentPosition(

            (position) => {

                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;

                setForm(prev => ({
                    ...prev,
                    latitude: String(latitude),
                    longitude: String(longitude),
                    locationAddress: `${latitude}, ${longitude}`
                }));

                setGettingLocation(false);

                setSuccess('Current location captured successfully.');

            },

            (err) => {

                setGettingLocation(false);

                setError(
                    err.code === 1
                        ? 'Location permission denied. Please allow location access.'
                        : 'Unable to capture your location. Try again.'
                );

            },

            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 0
            }

        );

    };

    // Reset form
    const resetForm = () => {

        setForm(emptyForm);
        setEditingId(null);

    };

    // Create or update SOS alert
    const handleSubmit = async (e) => {

        e.preventDefault();

        setError('');
        setSuccess('');

        if (!user?.id) {
            setError('Please login to continue.');
            return;
        }

        const latitude = form.latitude.trim() === ''
            ? null
            : Number(form.latitude);

        const longitude = form.longitude.trim() === ''
            ? null
            : Number(form.longitude);

        if (
            (latitude === null) !== (longitude === null) ||
            (latitude !== null &&
                (!Number.isFinite(latitude) ||
                    latitude < -90 || latitude > 90)) ||
            (longitude !== null &&
                (!Number.isFinite(longitude) ||
                    longitude < -180 || longitude > 180))
        ) {

            setError('Please enter valid latitude and longitude together.');
            return;

        }

        if (!form.message.trim()) {

            setError('Please enter an emergency message.');
            return;

        }

        const payload = {

            userId: Number(user.id),
            latitude,
            longitude,
            locationAddress: form.locationAddress.trim(),
            message: form.message.trim()

        };

        try {

            setSaving(true);

            const url = editingId
                ? `${API}/${editingId}/user/${user.id}`
                : API;

            const response = await fetch(url, {

                method: editingId ? 'PUT' : 'POST',

                headers: {
                    'Content-Type': 'application/json'
                },

                body: JSON.stringify(payload)

            });

            if (!response.ok) {
                throw new Error('Failed to save SOS alert.');
            }

            setSuccess(
                editingId
                    ? 'SOS alert updated successfully.'
                    : 'SOS alert created successfully.'
            );

            resetForm();

            await loadAlerts();

        } catch (err) {

            setError(err.message);

        } finally {

            setSaving(false);

        }

    };

    // Edit SOS alert
    const handleEdit = (alert) => {

        if (alert.status === 'RESOLVED') {

            setError('Resolved alerts cannot be edited.');
            return;

        }

        setEditingId(alert.id);

        setForm({

            latitude: alert.latitude ?? '',
            longitude: alert.longitude ?? '',
            locationAddress: alert.locationAddress ?? '',
            message: alert.message ?? ''

        });

        setError('');
        setSuccess('');

        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });

    };

    // Resolve SOS alert
    const handleResolve = async (id) => {

        if (!window.confirm('Are you sure you want to resolve this alert?')) {
            return;
        }

        try {

            setError('');
            setSuccess('');

            const response = await fetch(
                `${API}/${id}/resolve/user/${user.id}`,
                {
                    method: 'PATCH'
                }
            );

            if (!response.ok) {
                throw new Error('Unable to resolve SOS alert.');
            }

            setSuccess('SOS alert resolved successfully.');

            await loadAlerts();

        } catch (err) {

            setError(err.message);

        }

    };

    // Delete SOS alert
    const handleDelete = async (id) => {

        if (!window.confirm('Are you sure you want to delete this SOS alert?')) {
            return;
        }

        try {

            setError('');
            setSuccess('');

            const response = await fetch(
                `${API}/${id}/user/${user.id}`,
                {
                    method: 'DELETE'
                }
            );

            if (!response.ok) {
                throw new Error('Unable to delete SOS alert.');
            }

            if (editingId === id) {
                resetForm();
            }

            setSuccess('SOS alert deleted successfully.');

            await loadAlerts();

        } catch (err) {

            setError(err.message);

        }

    };

    // Format date and time
    const formatDate = (date) => {

        if (!date) return 'Not available';

        return new Date(date).toLocaleString('en-IN', {

            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'

        });

    };

    return (

        <div className="sos-page">

            {/* Navbar */}
            <nav className="sos-navbar">

                <h2>
                    Safe<span>Route</span>
                </h2>

                <button onClick={() => navigate('/dashboard')}>
                    Back to Dashboard
                </button>

            </nav>

            <main className="sos-container">

                {/* Heading */}
                <div className="sos-heading">

                    <div>
                        <h1>SOS Emergency Centre</h1>
                        <p>Create and manage your emergency alerts.</p>
                    </div>

                    <button
                        className="sos-refresh"
                        onClick={loadAlerts}
                        disabled={loading}
                    >
                        {loading ? 'Refreshing...' : 'Refresh Alerts'}
                    </button>

                </div>

                {/* Messages */}
                {error && (
                    <div className="sos-message error-message">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="sos-message success-message">
                        {success}
                    </div>
                )}

                {/* Create / Edit Form */}
                <section className="sos-form-card">

                    <h2>
                        {editingId
                            ? 'Edit SOS Alert'
                            : 'Create Emergency Alert'}
                    </h2>

                    <form onSubmit={handleSubmit}>

                        <label>Emergency Message</label>

                        <textarea
                            name="message"
                            value={form.message}
                            onChange={handleChange}
                            placeholder="Describe your emergency..."
                            rows="4"
                            required
                        />

                        <div className="sos-location-heading">

                            <label>Emergency Location</label>

                            <button
                                type="button"
                                className="location-btn"
                                onClick={captureLocation}
                                disabled={gettingLocation}
                            >
                                {gettingLocation
                                    ? 'Capturing...'
                                    : 'Capture My Location'}
                            </button>

                        </div>

                        <div className="sos-input-row">

                            <div>

                                <label>Latitude</label>

                                <input
                                    type="number"
                                    step="any"
                                    name="latitude"
                                    value={form.latitude}
                                    onChange={handleChange}
                                    placeholder="Enter latitude"
                                />

                            </div>

                            <div>

                                <label>Longitude</label>

                                <input
                                    type="number"
                                    step="any"
                                    name="longitude"
                                    value={form.longitude}
                                    onChange={handleChange}
                                    placeholder="Enter longitude"
                                />

                            </div>

                        </div>

                        <label>Location Address / Details</label>

                        <input
                            type="text"
                            name="locationAddress"
                            value={form.locationAddress}
                            onChange={handleChange}
                            placeholder="Enter location details"
                        />

                        <div className="sos-form-actions">

                            <button
                                type="submit"
                                className="sos-submit-btn"
                                disabled={saving}
                            >
                                {saving
                                    ? 'Saving...'
                                    : editingId
                                        ? 'Update Alert'
                                        : 'Create SOS Alert'}
                            </button>

                            {editingId && (

                                <button
                                    type="button"
                                    className="sos-cancel-btn"
                                    onClick={resetForm}
                                >
                                    Cancel
                                </button>

                            )}

                        </div>

                    </form>

                </section>

                {/* SOS Alert History */}
                <section className="sos-history">

                    <div className="sos-history-heading">

                        <div>
                            <h2>Emergency Alert History</h2>
                            <p>View and manage your saved SOS alerts.</p>
                        </div>

                        <span>{alerts.length} Alerts</span>

                    </div>

                    {loading ? (

                        <p className="sos-empty">
                            Loading alerts...
                        </p>

                    ) : alerts.length === 0 ? (

                        <div className="sos-empty">

                            <h3>No SOS Alerts Yet</h3>

                            <p>
                                Your emergency alert history will appear here.
                            </p>

                        </div>

                    ) : (

                        <div className="sos-alert-list">

                            {alerts.map(alert => (

                                <article
                                    className="sos-alert-card"
                                    key={alert.id}
                                >

                                    <div className="sos-alert-top">

                                        <div>

                                            <h3>
                                                Emergency Alert #{alert.id}
                                            </h3>

                                            <p>
                                                {formatDate(alert.createdAt)}
                                            </p>

                                        </div>

                                        <span
                                            className={`sos-status ${
                                                alert.status === 'ACTIVE'
                                                    ? 'active-status'
                                                    : 'resolved-status'
                                            }`}
                                        >
                                            {alert.status}
                                        </span>

                                    </div>

                                    <p className="sos-alert-message">
                                        {alert.message || 'No message provided'}
                                    </p>

                                    <div className="sos-alert-location">

                                        <p>
                                            <strong>Location:</strong>{' '}
                                            {alert.locationAddress || 'Not available'}
                                        </p>

                                        {alert.latitude != null &&
                                            alert.longitude != null && (

                                                <a
                                                    href={`https://www.google.com/maps?q=${alert.latitude},${alert.longitude}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    View on Google Maps
                                                </a>

                                            )}

                                    </div>

                                    <p className="sos-updated">
                                        Last updated: {formatDate(alert.updatedAt)}
                                    </p>

                                    <div className="sos-alert-actions">

                                        {alert.status === 'ACTIVE' && (

                                            <>

                                                <button
                                                    className="sos-edit-btn"
                                                    onClick={() => handleEdit(alert)}
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    className="sos-resolve-btn"
                                                    onClick={() => handleResolve(alert.id)}
                                                >
                                                    Resolve Alert
                                                </button>

                                            </>

                                        )}

                                        <button
                                            className="sos-delete-btn"
                                            onClick={() => handleDelete(alert.id)}
                                        >
                                            Delete
                                        </button>

                                    </div>

                                </article>

                            ))}

                        </div>

                    )}

                </section>

            </main>

            {/* Footer */}
            <footer className="sos-footer">

                <h3>
                    Safe<span>Route</span>
                </h3>

                <p>Travel Smart. Stay Safe.</p>

                <p>© 2026 SafeRoute. All rights reserved.</p>

            </footer>

        </div>

    );

}

export default SOS;
