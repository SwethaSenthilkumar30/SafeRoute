
import { useState, useEffect } from 'react';

import { useNavigate } from 'react-router-dom';

import './SafetyCentre.css';

function SafetyCentre() {

    const navigate = useNavigate();

    const API = 'http://localhost:8081/api/safety-checklist';

    const user = JSON.parse(
        localStorage.getItem('user') || 'null'
    );

    const userId = user?.id;

    const checklistItems = [
        {
            key: 'journey_details',
            label: 'Share your journey details with trusted contacts'
        },
        {
            key: 'emergency_numbers',
            label: 'Save important emergency phone numbers'
        },
        {
            key: 'phone_charged',
            label: 'Keep your phone fully charged'
        },
        {
            key: 'identification',
            label: 'Carry identification and necessary documents'
        },
        {
            key: 'check_route',
            label: 'Check your travel route before starting'
        },
        {
            key: 'update_contacts',
            label: 'Keep emergency contacts updated'
        }
    ];

    const [checkedItems, setCheckedItems] = useState([]);

    const [loading, setLoading] = useState(true);

    const [saving, setSaving] = useState(false);

    const [message, setMessage] = useState('');

    // Load saved checklist from backend
    useEffect(() => {

        const loadChecklist = async () => {

            if (!userId) {
                setMessage('User information not found. Please log in again.');
                setLoading(false);
                return;
            }

            try {

                const response = await fetch(
                    `${API}/${userId}`
                );

                if (!response.ok) {
                    throw new Error('Unable to load checklist');
                }

                const savedItems = await response.json();

                setCheckedItems(savedItems);

            } catch (error) {

                console.error('Checklist loading error:', error);

                setMessage('Unable to load saved checklist.');

            } finally {

                setLoading(false);

            }
        };

        loadChecklist();

    }, [userId]);
	

	const handleResetChecklist = async () => {

	    setCheckedItems([]);
	    setSaving(true);
	    setMessage('');

	    try {

	        const response = await fetch(
	            `${API}/${userId}`,
	            {
	                method: 'PUT',
	                headers: {
	                    'Content-Type': 'application/json'
	                },
	                body: JSON.stringify([])
	            }
	        );

	        if (!response.ok) {
	            throw new Error('Unable to reset checklist');
	        }

	        setMessage('Checklist reset successfully.');

	    } catch (error) {

	        console.error('Checklist reset error:', error);

	        setMessage('Unable to reset checklist. Please try again.');

	    } finally {

	        setSaving(false);

	    }
	};


    // Save checklist whenever user checks or unchecks an item
    const handleChecklist = async (itemKey) => {

        const updatedItems = checkedItems.includes(itemKey)

            ? checkedItems.filter(item => item !== itemKey)

            : [...checkedItems, itemKey];

        setCheckedItems(updatedItems);

        setSaving(true);
        setMessage('');

        try {

            const response = await fetch(
                `${API}/${userId}`,
                {
                    method: 'PUT',

                    headers: {
                        'Content-Type': 'application/json'
                    },

                    body: JSON.stringify(updatedItems)
                }
            );

            if (!response.ok) {
                throw new Error('Unable to save checklist');
            }

            setMessage('Checklist progress saved successfully.');

        } catch (error) {

            console.error('Checklist saving error:', error);

            setCheckedItems(checkedItems);

            setMessage('Unable to save progress. Please try again.');

        } finally {

            setSaving(false);

        }
    };

    const progress = Math.round(
        (checkedItems.length / checklistItems.length) * 100
    );

    return (

        <div className="safety-centre-page">

            <header className="safety-centre-header">

                <div>

                    <p className="safety-label">SAFETY FIRST</p>

                    <h1>Safety Centre</h1>

                    <p>
                        Helpful safety information to make every
                        journey safer and more comfortable.
                    </p>

                </div>

                <button
                    className="safety-dashboard-btn"
                    onClick={() => navigate('/dashboard')}
                >
                    Back to Dashboard
                </button>

            </header>

            <section className="emergency-number-section">

                <div>

                    <p>INDIA EMERGENCY RESPONSE NUMBER</p>

                    <h2>112</h2>

                    <span>
                        Call 112 for emergency assistance.
                    </span>

                </div>

                <a href="tel:112" className="emergency-call-btn">
                    Call Emergency
                </a>

            </section>

            <section className="safety-shortcuts">

                <h2>Emergency Shortcuts</h2>

                <div className="safety-shortcut-grid">

                    <div className="safety-shortcut-card">

                        <h3>SOS Alerts</h3>

                        <p>
                            Create and manage your emergency alerts.
                        </p>

                        <button onClick={() => navigate('/sos')}>
                            Open SOS Centre
                        </button>

                    </div>

                    <div className="safety-shortcut-card">

                        <h3>Emergency Contacts</h3>

                        <p>
                            Contact the trusted people in your list.
                        </p>

                        <button
                            onClick={() => navigate('/emergency-contacts')}
                        >
                            View Contacts
                        </button>

                    </div>

                </div>

            </section>

            <section className="travel-tips-section">

                <h2>Travel Safety Tips</h2>

                <div className="travel-tips-grid">

                    <div className="travel-tip-card">

                        <span>01</span>

                        <h3>Before Your Journey</h3>

                        <p>
                            Plan your route, check travel details
                            and inform someone you trust.
                        </p>

                    </div>

                    <div className="travel-tip-card">

                        <span>02</span>

                        <h3>During Your Journey</h3>

                        <p>
                            Stay aware of your surroundings and
                            keep your phone accessible.
                        </p>

                    </div>

                    <div className="travel-tip-card">

                        <span>03</span>

                        <h3>At Your Destination</h3>

                        <p>
                            Inform your trusted contacts when
                            you reach your destination safely.
                        </p>

                    </div>

                </div>

            </section>

            <section className="safety-checklist-section">

                <div className="checklist-heading">

                    <div>

                        <h2>Travel Safety Checklist</h2>

                        <p>
                            Complete these steps before starting
                            your journey.
                        </p>

                    </div>

                    <h3>{progress}% Completed</h3>
					<button
					    onClick={handleResetChecklist}
					    disabled={saving || checkedItems.length === 0}
					>
					    Reset Checklist
					</button>

                </div>

                <div className="checklist-progress">

                    <div style={{ width: `${progress}%` }}></div>

                </div>

                {loading ? (

                    <p>Loading your saved checklist...</p>

                ) : (

                    <div className="checklist-items">

                        {checklistItems.map((item) => (

                            <label
                                className="checklist-item"
                                key={item.key}
                            >

                                <input
                                    type="checkbox"
                                    checked={checkedItems.includes(item.key)}
                                    onChange={() => handleChecklist(item.key)}
                                />

                                <span>{item.label}</span>

                            </label>

                        ))}

                    </div>

                )}

                {saving && (
                    <p>Saving your progress...</p>
                )}

                {message && (
                    <p>{message}</p>
                )}

                {progress === 100 && !loading && (

                    <p className="checklist-complete">
                        You have completed your travel safety checklist.
                    </p>

                )}

            </section>

        </div>

    );

}

export default SafetyCentre;
