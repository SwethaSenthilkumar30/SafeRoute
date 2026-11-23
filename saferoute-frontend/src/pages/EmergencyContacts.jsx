
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './EmergencyContacts.css';

function EmergencyContacts() {

    const navigate = useNavigate();

    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingContact, setEditingContact] = useState(null);

    const [fullName, setFullName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [relationship, setRelationship] = useState('');
    const [message, setMessage] = useState('');

    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const userId = user?.id;

    // Fetch emergency contacts
    useEffect(() => {
        let ignore = false;

        const fetchContacts = async () => {
            if (!userId) {
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(
                    `http://localhost:8081/api/emergency-contacts/user/${userId}`
                );

                if (!response.ok) {
                    throw new Error('Failed to fetch contacts');
                }

                const data = await response.json();

                if (!ignore) {
                    setContacts(data);
                }
            } catch (error) {
                if (!ignore) {
                    console.error(error);
                    setMessage('Unable to load emergency contacts.');
                }
            } finally {
                if (!ignore) {
                    setLoading(false);
                }
            }
        };

        fetchContacts();

        return () => {
            ignore = true;
        };
    }, [userId]);

    // Reset form
    const resetForm = () => {
        setFullName('');
        setPhoneNumber('');
        setRelationship('');
        setEditingContact(null);
        setShowForm(false);
        setMessage('');
    };

    // Open Add form
    const handleAddClick = () => {
        setEditingContact(null);
        setFullName('');
        setPhoneNumber('');
        setRelationship('');
        setMessage('');
        setShowForm(true);
    };

    // Open Edit form
    const handleEditClick = (contact) => {
        setEditingContact(contact);
        setFullName(contact.fullName);
        setPhoneNumber(contact.phoneNumber);
        setRelationship(contact.relationship);
        setMessage('');
        setShowForm(true);
    };

    // Add or Update contact
    const handleSaveContact = async (e) => {
        e.preventDefault();
        setMessage('');

        if (!fullName.trim() || !relationship.trim()) {
            setMessage('Please fill in all fields.');
            return;
        }

        if (!/^[0-9]{10}$/.test(phoneNumber)) {
            setMessage('Enter a valid 10-digit phone number.');
            return;
        }

        const contact = {
            userId: userId,
            fullName: fullName.trim(),
            phoneNumber: phoneNumber,
            relationship: relationship.trim(),
            primaryContact: editingContact
                ? editingContact.primaryContact
                : contacts.length === 0
        };

        try {
            const isEditing = editingContact !== null;

            const response = await fetch(
                isEditing
                    ? `http://localhost:8081/api/emergency-contacts/${editingContact.id}`
                    : 'http://localhost:8081/api/emergency-contacts',
                {
                    method: isEditing ? 'PUT' : 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(contact)
                }
            );

            if (!response.ok) {
                throw new Error('Failed to save contact');
            }

            const savedContact = await response.json();

            if (isEditing) {
                setContacts((previousContacts) =>
                    previousContacts.map((item) =>
                        item.id === savedContact.id ? savedContact : item
                    )
                );
            } else {
                setContacts((previousContacts) => [
                    ...previousContacts,
                    savedContact
                ]);
            }

            resetForm();

        } catch (error) {
            console.error('Error saving contact:', error);
            setMessage('Unable to save contact. Please try again.');
        }
    };

    // Delete contact
    const handleDeleteContact = async (contactId) => {
        const confirmDelete = window.confirm(
            'Are you sure you want to delete this emergency contact?'
        );

        if (!confirmDelete) return;

        try {
            const response = await fetch(
                `http://localhost:8081/api/emergency-contacts/${contactId}`,
                {
                    method: 'DELETE'
                }
            );

            if (!response.ok) {
                throw new Error('Failed to delete contact');
            }

            setContacts((previousContacts) =>
                previousContacts.filter(
                    (contact) => contact.id !== contactId
                )
            );

            setMessage('');

        } catch (error) {
            console.error('Error deleting contact:', error);
            setMessage('Unable to delete contact. Please try again.');
        }
    };

    // Set primary contact
    const handleSetPrimary = async (contactId) => {
        try {
            const response = await fetch(
                `http://localhost:8081/api/emergency-contacts/${contactId}/primary`,
                {
                    method: 'PATCH'
                }
            );

            if (!response.ok) {
                throw new Error('Failed to set primary contact');
            }

            const updatedContact = await response.json();

            setContacts((previousContacts) =>
                previousContacts.map((contact) => ({
                    ...contact,
                    primaryContact: contact.id === updatedContact.id
                }))
            );

            setMessage('Primary contact updated successfully.');

        } catch (error) {
            console.error('Error setting primary contact:', error);
            setMessage('Unable to update primary contact.');
        }
    };

    return (
        <div className="emergency-contacts-page">

            {/* Header */}
            <div className="contacts-header">

                <div>
                    <h1>Emergency Contacts</h1>
                    <p>Manage your trusted emergency contacts.</p>
                </div>

                <div className="contacts-header-actions">

                    <button
                        type="button"
                        className="back-dashboard-btn"
                        onClick={() => navigate('/dashboard')}
                    >
                        Back to Dashboard
                    </button>

                    <button
                        type="button"
                        className="add-contact-btn"
                        onClick={handleAddClick}
                    >
                        + Add Contact
                    </button>

                </div>
            </div>

            {/* Message */}
            {message && (
                <p className="contact-message">{message}</p>
            )}

            {/* Add / Edit Form */}
            {showForm && (
                <div className="contact-modal-backdrop">

                    <form
                        className="contact-form"
                        onSubmit={handleSaveContact}
                    >

                        <h2>
                            {editingContact
                                ? 'Edit Emergency Contact'
                                : 'Add Emergency Contact'}
                        </h2>

                        <p className="form-subtitle">
                            Add someone you trust to help in an emergency.
                        </p>

                        <label>Full Name</label>

                        <input
                            type="text"
                            placeholder="Enter full name"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                        />

                        <label>Phone Number</label>

                        <input
                            type="tel"
                            placeholder="Enter 10-digit phone number"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            maxLength="10"
                            required
                        />

                        <label>Relationship</label>

                        <input
                            type="text"
                            placeholder="Example: Father, Mother, Friend"
                            value={relationship}
                            onChange={(e) => setRelationship(e.target.value)}
                            required
                        />

                        <div className="form-buttons">

                            <button
                                type="button"
                                className="cancel-form-btn"
                                onClick={resetForm}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="save-contact-btn"
                            >
                                {editingContact
                                    ? 'Update Contact'
                                    : 'Save Contact'}
                            </button>

                        </div>

                    </form>
                </div>
            )}

            {/* Loading and Contact List */}
            {loading ? (
                <p>Loading contacts...</p>
            ) : contacts.length === 0 ? (

                <div className="empty-contacts">
                    <h3>No Emergency Contacts Added</h3>
                    <p>
                        Add trusted people so you can reach them
                        quickly during an emergency.
                    </p>
                </div>

            ) : (

                <div className="contacts-list">

                    {contacts.map((contact) => (

                        <div className="contact-card" key={contact.id}>

                            <h3>{contact.fullName}</h3>

                            <p>Phone: {contact.phoneNumber}</p>

                            <p>Relationship: {contact.relationship}</p>

                            {contact.primaryContact && (
                                <span className="primary-label">
                                    Primary Contact
                                </span>
                            )}

                            <div className="contact-actions">

                                <a
                                    href={`tel:${contact.phoneNumber}`}
                                    className="call-contact-btn"
                                >
                                    Call
                                </a>

                                <button
                                    type="button"
                                    className="edit-contact-btn"
                                    onClick={() => handleEditClick(contact)}
                                >
                                    Edit
                                </button>

                                <button
                                    type="button"
                                    className="delete-contact-btn"
                                    onClick={() => handleDeleteContact(contact.id)}
                                >
                                    Delete
                                </button>

                            </div>

                            {!contact.primaryContact && (
                                <button
                                    type="button"
                                    className="set-primary-btn"
                                    onClick={() => handleSetPrimary(contact.id)}
                                >
                                    Set as Primary
                                </button>
                            )}

                        </div>

                    ))}

                </div>
            )}

        </div>
    );
}

export default EmergencyContacts;
