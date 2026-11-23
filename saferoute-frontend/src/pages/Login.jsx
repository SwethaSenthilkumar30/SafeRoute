
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';

function Login() {

    const navigate = useNavigate();

    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (event) => {

        event.preventDefault();

        if (!email || !password) {
            alert('Please enter your email and password.');
            return;
        }

        try {

            setLoading(true);

            const response = await fetch(
                'http://localhost:8081/api/auth/login',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: email,
                        password: password
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || 'Login failed. Please check your credentials.'
                );
            }

            // Save logged-in user details
            localStorage.setItem('user', JSON.stringify(data));

            alert('Login successful! Welcome to SafeRoute.');

            // Redirect to Dashboard
            navigate('/dashboard');

        } catch (error) {

            alert(error.message);
            console.error('Login Error:', error);

        } finally {

            setLoading(false);

        }
    };

    return (

        <div className="login-page">

            <div className="login-left">

                <Link to="/" className="login-logo">
                    Safe<span>Route</span>
                </Link>

                <div className="login-form-container">

                    <p className="login-subtitle">
                        YOUR JOURNEY. YOUR SAFETY.
                    </p>

                    <h1>Welcome Back!</h1>

                    <p className="login-description">
                        Sign in to continue your journey
                        with confidence.
                    </p>

                    <form onSubmit={handleLogin}>

                        <div className="login-input-group">

                            <label>Email Address</label>

                            <input
                                type="email"
                                placeholder="Enter your email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />

                        </div>

                        <div className="login-input-group">

                            <label>Password</label>

                            <div className="password-wrapper">

                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />

                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? 'Hide' : 'Show'}
                                </button>

                            </div>

                        </div>

                        <div className="login-options">

                            <label className="remember-label">
                                <input type="checkbox" />
                                Remember me
                            </label>

                            <Link to="/forgot-password">
                                Forgot Password?
                            </Link>

                        </div>

                        <button
                            type="submit"
                            className="login-submit"
                            disabled={loading}
                        >
                            {loading ? 'Logging in...' : 'Login to SafeRoute'}
                        </button>

                    </form>

                    <p className="register-text">
                        Don't have an account?{' '}
                        <Link to="/register">
                            Create Account
                        </Link>
                    </p>

                </div>

                <p className="login-footer">
                    © 2026 SafeRoute. Travel Smart. Stay Safe.
                </p>

            </div>

            <div className="login-right">

                <div className="login-image-overlay"></div>

                <div className="login-image-content">

                    <h2>
                        Every journey
                        <br />
                        deserves peace of mind.
                    </h2>

                    <p>
                        Stay connected with your loved ones
                        and explore the world with confidence.
                    </p>

                    <span>
                        TRAVEL SMART. STAY SAFE.
                    </span>

                </div>

            </div>

        </div>

    );

}

export default Login;
