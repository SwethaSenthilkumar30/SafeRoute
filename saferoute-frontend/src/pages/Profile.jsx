
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

function Profile() {

    const navigate = useNavigate();

    const [user, setUser] = useState(() => {
        return JSON.parse(localStorage.getItem('user') || 'null');
    });

    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);

    const [fullName, setFullName] = useState(user?.fullName || '');
    const [phone, setPhone] = useState(user?.phone || '');

    const formatDate = (date) => {

        if (!date) return 'Not available';

        return new Date(date).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    };

    const handleCancel = () => {

        setFullName(user?.fullName || '');
        setPhone(user?.phone || '');
        setIsEditing(false);
    };

    const handleUpdate = async (event) => {

        event.preventDefault();

        if (!user?.id) {
            alert('User information not found. Please login again.');
            return;
        }

        try {

            setLoading(true);

            const response = await fetch(
                `http://localhost:8081/api/auth/profile/${user.id}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        fullName: fullName,
                        phone: phone
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Profile update failed');
            }

            setUser(data);

            localStorage.setItem('user', JSON.stringify(data));

            setIsEditing(false);

            alert('Profile updated successfully!');

        } catch (error) {

            alert(error.message);
            console.error('Profile Update Error:', error);

        } finally {

            setLoading(false);
        }
    };

    return (

        <div className="profile-page">

            <nav className="profile-navbar">

                <h2>Safe<span>Route</span></h2>

                <button onClick={() => navigate('/dashboard')}>
                    Back to Dashboard
                </button>

            </nav>

            <div className="profile-content">

                <h1>My Profile</h1>

                <p>Manage and view your account information.</p>

                <div className="profile-card">

                    <div className="profile-avatar">
                        {user?.fullName?.charAt(0).toUpperCase() || 'U'}
                    </div>

                    <h2>{user?.fullName || 'User'}</h2>

                    <p className="profile-role">
                        SafeRoute Member
                    </p>

                    {isEditing ? (

                        <form onSubmit={handleUpdate}>

                            <div className="profile-details">

                                <div className="profile-detail">

                                    <label>Full Name</label>

                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        required
                                    />

                                </div>

                                <div className="profile-detail">

                                    <label>Email Address</label>

                                    <p>{user?.email || 'Not available'}</p>

                                </div>

                                <div className="profile-detail">

                                    <label>Phone Number</label>

                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        required
                                    />

                                </div>

                                <div className="profile-detail">

                                    <label>Account Created</label>

                                    <p>{formatDate(user?.createdAt)}</p>

                                </div>

                            </div>

                            <div className="profile-actions">

                                <button
                                    type="submit"
                                    className="save-profile-btn"
                                    disabled={loading}
                                >
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </button>

                                <button
                                    type="button"
                                    className="cancel-profile-btn"
                                    onClick={handleCancel}
                                    disabled={loading}
                                >
                                    Cancel
                                </button>

                            </div>

                        </form>

                    ) : (

                        <>

                            <div className="profile-details">

                                <div className="profile-detail">
                                    <label>Full Name</label>
                                    <p>{user?.fullName || 'Not available'}</p>
                                </div>

                                <div className="profile-detail">
                                    <label>Email Address</label>
                                    <p>{user?.email || 'Not available'}</p>
                                </div>

                                <div className="profile-detail">
                                    <label>Phone Number</label>
                                    <p>{user?.phone || 'Not available'}</p>
                                </div>

                                <div className="profile-detail">
                                    <label>Account Created</label>
                                    <p>{formatDate(user?.createdAt)}</p>
                                </div>

                            </div>

                            <div className="profile-actions">

                                <button
                                    className="save-profile-btn"
                                    onClick={() => setIsEditing(true)}
                                >
                                    Edit Profile
                                </button>

                            </div>

                        </>

                    )}

                </div>

            </div>

        </div>

    );
}

export default Profile;
