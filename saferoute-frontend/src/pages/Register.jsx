
import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Register.css';

function Register() {

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [accepted, setAccepted] = useState(false);

	const handleRegister = async (e) => {

	    e.preventDefault();

	    if (password !== confirmPassword) {
	        alert('Passwords do not match!');
	        return;
	    }

	    if (!accepted) {
	        alert('Please accept the terms and conditions.');
	        return;
	    }

	    try {

	        const response = await fetch('http://localhost:8081/api/auth/register', {

	            method: 'POST',

	            headers: {
	                'Content-Type': 'application/json'
	            },

	            body: JSON.stringify({
	                fullName: name,
	                email: email,
	                phone: phone,
	                password: password
	            })

	        });

	        const data = await response.json();

	        if (!response.ok) {
	            throw new Error(data.message || 'Registration failed');
	        }

	        alert('Registration successful!');

	        console.log(data);

	    } catch (error) {

	        alert(error.message);

	        console.error('Registration Error:', error);

	    }

	};

    return (
        <div className="register-page">

            <div className="register-left">

                <Link to="/" className="register-logo">
                    Safe<span>Route</span>
                </Link>

                <div className="register-form-container">

                    <p className="register-subtitle">
                        BEGIN YOUR SAFE JOURNEY
                    </p>

                    <h1>Create Account</h1>

                    <p className="register-description">
                        Join SafeRoute and make every journey
                        a safer experience.
                    </p>

                    <form onSubmit={handleRegister}>

                        <div className="register-input-group">
                            <label>Full Name</label>
                            <input
                                type="text"
                                placeholder="Enter your full name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="register-input-group">
                            <label>Email Address</label>
                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="register-input-group">
                            <label>Phone Number</label>
                            <input
                                type="tel"
                                placeholder="Enter 10-digit phone number"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                pattern="[0-9]{10}"
                                required
                            />
                        </div>

                        <div className="register-input-group">
                            <label>Password</label>

                            <div className="register-password-wrapper">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Create password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    minLength={8}
                                    required
                                />

                                <button
                                    type="button"
                                    className="register-password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? 'Hide' : 'Show'}
                                </button>
                            </div>
                        </div>

                        <div className="register-input-group">
                            <label>Confirm Password</label>
                            <input
                                type="password"
                                placeholder="Confirm your password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>

                        <label className="register-terms">
                            <input
                                type="checkbox"
                                checked={accepted}
                                onChange={(e) => setAccepted(e.target.checked)}
                            />
                            <span>
                                I agree to the Terms and Conditions.
                            </span>
                        </label>

                        <button type="submit" className="register-submit">
                            Create My Account
                        </button>

                    </form>

                    <p className="register-login-text">
                        Already have an account?{' '}
                        <Link to="/login">Login</Link>
                    </p>

                </div>

                <p className="register-footer">
                    © 2026 SafeRoute. Travel Smart. Stay Safe.
                </p>

            </div>

            <div className="register-right">

                <div className="register-image-overlay"></div>

                <div className="register-image-content">

                    <h2>
                        Your next adventure
                        <br />
                        starts with safety.
                    </h2>

                    <p>
                        Connect with your loved ones,
                        organize your journeys and
                        travel with confidence.
                    </p>

                    <span>YOUR JOURNEY. YOUR SAFETY.</span>

                </div>

            </div>

        </div>
    );
}

export default Register;
