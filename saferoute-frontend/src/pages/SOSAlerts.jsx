
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SOSAlerts.css';

function SOSAlerts() {

    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const userId = user?.id;

    const [alerts, setAlerts] = useState([]);
    const [emergencyContacts, setEmergencyContacts] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showForm, setShowForm] = useState(false);
    const [editingAlert, setEditingAlert] = useState(null);

    const [message, setMessage] = useState('');
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');
    const [locationAddress, setLocationAddress] = useState('');

    const [notice, setNotice] = useState('');

    // Fetch SOS alerts and emergency contacts
    useEffect(() => {
        let ignore = false;

        const fetchData = async () => {

            if (!userId) {
                return;
            }

            try {
                const response = await fetch(
                    `http://localhost:8081/api/sos/user/${userId}`
                );

                if (!response.ok) {
                    throw new Error('Unable to load SOS alerts');
                }

                const data = await response.json();

                if (!ignore) {
                    setAlerts(data);
                }

            } catch (error) {
                if (!ignore) {
                    console.error('Error loading alerts:', error);
                    setNotice('Unable to load SOS alert history.');
                }
            }

            try {
                const response = await fetch(
                    `http://localhost:8081/api/emergency-contacts/user/${userId}`
                );

                if (!response.ok) {
                    throw new Error('Unable to load emergency contacts');
                }

                const data = await response.json();

                if (!ignore) {
                    setEmergencyContacts(data);
                }

            } catch (error) {
                if (!ignore) {
                    console.error(
                        'Error loading emergency contacts:',
                        error
                    );
                }
            }

            if (!ignore) {
                setLoading(false);
            }
        };

        fetchData();

        return () => {
            ignore = true;
        };

    }, [userId]);

    // Reset form
    const resetForm = () => {
        setMessage('');
        setLatitude('');
        setLongitude('');
        setLocationAddress('');
        setEditingAlert(null);
        setShowForm(false);
        setNotice('');
    };

    // Open new SOS form
    const handleNewAlert = () => {
        setEditingAlert(null);
        setMessage('');
        setLatitude('');
        setLongitude('');
        setLocationAddress('');
        setNotice('');
        setShowForm(true);
    };

    // Open edit form
    const handleEdit = (alert) => {
        setEditingAlert(alert);
        setMessage(alert.message || '');

        setLatitude(
            alert.latitude !== null && alert.latitude !== undefined
                ? String(alert.latitude)
                : ''
        );

        setLongitude(
            alert.longitude !== null && alert.longitude !== undefined
                ? String(alert.longitude)
                : ''
        );

        setLocationAddress(alert.locationAddress || '');
        setNotice('');
        setShowForm(true);
    };

    // Capture current GPS location
    const handleGetLocation = () => {

        setNotice('');

        if (!navigator.geolocation) {
            setNotice('Your browser does not support location access.');
            return;
        }

        navigator.geolocation.getCurrentPosition(

            (position) => {
                setLatitude(String(position.coords.latitude));
                setLongitude(String(position.coords.longitude));
                setLocationAddress('GPS location captured');
                setNotice('Your current location has been captured.');
            },

            (error) => {
                console.error('Location error:', error);

                if (error.code === 1) {
                    setNotice(
                        'Location permission denied. Please allow location access.'
                    );
                } else {
                    setNotice(
                        'Unable to get your location. Please try again.'
                    );
                }
            },

            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 0
            }
        );
    };

    // Add or update SOS alert
    const handleSaveAlert = async (e) => {

        e.preventDefault();
        setNotice('');

        if (!userId) {
            setNotice('Please log in again to continue.');
            return;
        }

        if (!message.trim()) {
            setNotice('Please enter an emergency message.');
            return;
        }

        const hasLatitude = latitude.trim() !== '';
        const hasLongitude = longitude.trim() !== '';

        if (hasLatitude !== hasLongitude) {
            setNotice('Enter both latitude and longitude.');
            return;
        }

        const parsedLatitude = hasLatitude ? Number(latitude) : null;
        const parsedLongitude = hasLongitude ? Number(longitude) : null;

        if (
            hasLatitude &&
            (
                !Number.isFinite(parsedLatitude) ||
                parsedLatitude < -90 ||
                parsedLatitude > 90
            )
        ) {
            setNotice('Enter a valid latitude.');
            return;
        }

        if (
            hasLongitude &&
            (
                !Number.isFinite(parsedLongitude) ||
                parsedLongitude < -180 ||
                parsedLongitude > 180
            )
        ) {
            setNotice('Enter a valid longitude.');
            return;
        }

        const alertData = {
            userId,
            latitude: parsedLatitude,
            longitude: parsedLongitude,
            locationAddress: locationAddress.trim(),
            message: message.trim()
        };

        try {
            const isEditing = editingAlert !== null;

            const url = isEditing
                ? `http://localhost:8081/api/sos/${editingAlert.id}/user/${userId}`
                : 'http://localhost:8081/api/sos';

            const response = await fetch(url, {
                method: isEditing ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(alertData)
            });

            if (!response.ok) {
                throw new Error('Failed to save SOS alert');
            }

            const savedAlert = await response.json();

            if (isEditing) {
                setAlerts((previousAlerts) =>
                    previousAlerts.map((alert) =>
                        alert.id === savedAlert.id
                            ? savedAlert
                            : alert
                    )
                );
            } else {
                setAlerts((previousAlerts) => [
                    savedAlert,
                    ...previousAlerts
                ]);
            }

            resetForm();

            setNotice(
                isEditing
                    ? 'SOS alert updated successfully.'
                    : 'SOS alert recorded successfully.'
            );

        } catch (error) {
            console.error('Error saving SOS alert:', error);
            setNotice('Unable to save SOS alert. Please try again.');
        }
    };

    // Resolve SOS alert
    const handleResolve = async (alertId) => {

        const confirmResolve = window.confirm(
            'Are you sure you want to mark this SOS alert as resolved?'
        );

        if (!confirmResolve) return;

        try {
            const response = await fetch(
                `http://localhost:8081/api/sos/${alertId}/resolve/user/${userId}`,
                {
                    method: 'PATCH'
                }
            );

            if (!response.ok) {
                throw new Error('Failed to resolve alert');
            }

            const updatedAlert = await response.json();

            setAlerts((previousAlerts) =>
                previousAlerts.map((alert) =>
                    alert.id === updatedAlert.id
                        ? updatedAlert
                        : alert
                )
            );

            setNotice('SOS alert marked as resolved.');

        } catch (error) {
            console.error('Error resolving alert:', error);
            setNotice('Unable to resolve alert. Please try again.');
        }
    };

    // Delete SOS alert
    const handleDelete = async (alertId) => {

        const confirmDelete = window.confirm(
            'Are you sure you want to delete this SOS alert?'
        );

        if (!confirmDelete) return;

        try {
            const response = await fetch(
                `http://localhost:8081/api/sos/${alertId}/user/${userId}`,
                {
                    method: 'DELETE'
                }
            );

            if (!response.ok) {
                throw new Error('Failed to delete alert');
            }

            setAlerts((previousAlerts) =>
                previousAlerts.filter(
                    (alert) => alert.id !== alertId
                )
            );

            setNotice('SOS alert deleted successfully.');

        } catch (error) {
            console.error('Error deleting alert:', error);
            setNotice('Unable to delete alert. Please try again.');
        }
    };

    // Active alerts count
    const activeCount = alerts.filter(
        (alert) => alert.status === 'ACTIVE'
    ).length;

    // Resolved alerts count
    const resolvedCount = alerts.filter(
        (alert) => alert.status === 'RESOLVED'
    ).length;

    // Format date
    const formatDate = (date) => {
        if (!date) return 'Date unavailable';

        return new Date(date).toLocaleString();
    };

    return (

        <div className="sos-page">

            {/* Header */}
            <div className="sos-header">

                <div>
                    <h1>SOS Emergency Centre</h1>
                    <p>
                        Manage emergency alerts and your safety information.
                    </p>
                </div>

                <div className="sos-header-actions">

                    <button
                        type="button"
                        className="back-dashboard-btn"
                        onClick={() => navigate('/dashboard')}
                    >
                        Back to Dashboard
                    </button>

                    <button
                        type="button"
                        className="trigger-sos-btn"
                        onClick={handleNewAlert}
                    >
                        + Trigger SOS
                    </button>

                </div>

            </div>

            {/* Notice */}
            {notice && (
                <div className="sos-notice">
                    {notice}
                </div>
            )}

            {/* Summary */}
            <div className="sos-summary">

                <div className="sos-summary-card">
                    <span>Total Alerts</span>
                    <h2>{alerts.length}</h2>
                </div>

                <div className="sos-summary-card">
                    <span>Active Alerts</span>
                    <h2>{activeCount}</h2>
                </div>

                <div className="sos-summary-card">
                    <span>Resolved Alerts</span>
                    <h2>{resolvedCount}</h2>
                </div>

            </div>

            {/* SOS Form */}
            {showForm && (

                <div className="sos-modal-backdrop">

                    <form
                        className="sos-form"
                        onSubmit={handleSaveAlert}
                    >

                        <h2>
                            {editingAlert
                                ? 'Edit SOS Alert'
                                : 'Trigger SOS Alert'}
                        </h2>

                        <p>
                            Record your emergency details and location.
                        </p>

                        <label>Emergency Message</label>

                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Describe your emergency..."
                            rows="4"
                            required
                        />

                        <label>Location Address / Description</label>

                        <input
                            type="text"
                            value={locationAddress}
                            onChange={(e) =>
                                setLocationAddress(e.target.value)
                            }
                            placeholder="Enter location description"
                        />

                        <button
                            type="button"
                            className="get-location-btn"
                            onClick={handleGetLocation}
                        >
                            Get My Current Location
                        </button>

                        <div className="sos-coordinate-fields">

                            <div>
                                <label>Latitude</label>

                                <input
                                    type="number"
                                    step="any"
                                    value={latitude}
                                    onChange={(e) =>
                                        setLatitude(e.target.value)
                                    }
                                    placeholder="Latitude"
                                />
                            </div>

                            <div>
                                <label>Longitude</label>

                                <input
                                    type="number"
                                    step="any"
                                    value={longitude}
                                    onChange={(e) =>
                                        setLongitude(e.target.value)
                                    }
                                    placeholder="Longitude"
                                />
                            </div>

                        </div>

                        <p className="location-help">
                            Location access requires your permission.
                            You can also enter coordinates manually.
                        </p>

                        <div className="sos-form-actions">

                            <button
                                type="button"
                                className="sos-cancel-btn"
                                onClick={resetForm}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="sos-save-btn"
                            >
                                {editingAlert
                                    ? 'Update Alert'
                                    : 'Save SOS Alert'}
                            </button>

                        </div>

                    </form>

                </div>
            )}

            {/* Emergency Contacts */}
            <section className="sos-contacts-section">

                <h2>My Emergency Contacts</h2>

                {emergencyContacts.length === 0 ? (

                    <p>
                        No emergency contacts found. Add contacts in the
                        Emergency Contacts section.
                    </p>

                ) : (

                    <div className="sos-contacts-list">

                        {emergencyContacts.map((contact) => (

                            <div
                                className="sos-contact-card"
                                key={contact.id}
                            >

                                <div>
                                    <h3>{contact.fullName}</h3>

                                    <p>{contact.relationship}</p>

                                    <span>{contact.phoneNumber}</span>

                                    {contact.primaryContact && (
                                        <small>Primary Contact</small>
                                    )}
                                </div>

                                <a href={`tel:${contact.phoneNumber}`}>
                                    Call
                                </a>

                            </div>

                        ))}

                    </div>
                )}

            </section>

            {/* Alert History */}
            <section className="sos-history-section">

                <h2>SOS Alert History</h2>

                {loading ? (

                    <p>Loading SOS alerts...</p>

                ) : alerts.length === 0 ? (

                    <div className="sos-empty-state">
                        <h3>No SOS Alerts Yet</h3>

                        <p>
                            Your recorded emergency alerts will appear here.
                        </p>
                    </div>

                ) : (

                    <div className="sos-alert-list">

                        {alerts.map((alert) => (

                            <div
                                className="sos-alert-card"
                                key={alert.id}
                            >

                                <div className="sos-alert-top">

                                    <h3>
                                        Emergency Alert #{alert.id}
                                    </h3>

                                    <span
                                        className={
                                            alert.status === 'ACTIVE'
                                                ? 'sos-status active'
                                                : 'sos-status resolved'
                                        }
                                    >
                                        {alert.status}
                                    </span>

                                </div>

                                <p className="sos-alert-message">
                                    {alert.message}
                                </p>

                                <p>
                                    <strong>Location:</strong>{' '}
                                    {alert.locationAddress ||
                                        'Location not provided'}
                                </p>

                                <p>
                                    <strong>Coordinates:</strong>{' '}

                                    {alert.latitude !== null &&
                                    alert.latitude !== undefined &&
                                    alert.longitude !== null &&
                                    alert.longitude !== undefined
                                        ? `${alert.latitude}, ${alert.longitude}`
                                        : 'Not available'}
                                </p>

                                {alert.latitude !== null &&
                                alert.latitude !== undefined &&
                                alert.longitude !== null &&
                                alert.longitude !== undefined && (

                                    <a
                                        className="sos-map-link"
                                        href={`https://www.google.com/maps?q=${alert.latitude},${alert.longitude}`}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        View on Google Maps
                                    </a>

                                )}

                                <p className="sos-date">
                                    Created: {formatDate(alert.createdAt)}
                                </p>

                                <div className="sos-alert-actions">

                                    {alert.status === 'ACTIVE' && (

                                        <button
                                            type="button"
                                            className="resolve-alert-btn"
                                            onClick={() =>
                                                handleResolve(alert.id)
                                            }
                                        >
                                            Mark Resolved
                                        </button>

                                    )}

                                    <button
                                        type="button"
                                        className="edit-alert-btn"
                                        onClick={() => handleEdit(alert)}
                                    >
                                        Edit
                                    </button>

                                    <button
                                        type="button"
                                        className="delete-alert-btn"
                                        onClick={() =>
                                            handleDelete(alert.id)
                                        }
                                    >
                                        Delete
                                    </button>

                                </div>

                            </div>

                        ))}

                    </div>

                )}

            </section>

        </div>
    );
}

export default SOSAlerts;
