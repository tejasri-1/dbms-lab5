import React, { useState } from 'react';

function Login({ onLogin }) {

    // TODO: Use useState to manage:
    // 1. Signup/Login toggle
    // 2. Form data (username, password, email)
    // 3. Error messages
    const [isSignup, setIsSignup] = useState(false);
    const [formData, setFormData] = useState({ username: '', password: '', email: '' });
    const [error, setError] = useState('');

    // TODO: Implement handleSubmit function
    // - Prevent default form submission
    // - Choose endpoint based on login/signup
    // - Call POST /login or POST /signup API
    // - Handle success:
    //   - Call onLogin with user data
    // - Handle error responses
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const endpoint = isSignup ? '/signup' : '/login';

        try {
            const res = await fetch(`http://localhost:4000${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    username: formData.username,
                    password: formData.password,
                    ...(isSignup ? { email: formData.email } : {}),
                }),
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                setError(data.message || 'Request failed');
                return;
            }

            // /login returns { message, user }, /signup returns user object
            const userObj = data.user || data;
            if (!userObj || !userObj.user_id) {
                setError('Unexpected response from server');
                return;
            }

            onLogin(userObj);
        } catch (err) {
            console.error('Auth failed', err);
            setError('Something went wrong. Please try again.');
        }
    };

    return (
        <div className="auth-page">
            <h2>{isSignup ? 'Sign Up' : 'Login'}</h2>

            {error && <div className="error">{error}</div>}

            <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <input
                        id="username"
                        name="username"
                        type="text"
                        value={formData.username}
                        onChange={(e) =>
                            setFormData({ ...formData, username: e.target.value })
                        }
                        required
                    />
                </div>

                {isSignup && (
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) =>
                                setFormData({ ...formData, email: e.target.value })
                            }
                            required
                        />
                    </div>
                )}

                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) =>
                            setFormData({ ...formData, password: e.target.value })
                        }
                        required
                    />
                </div>

                <button type="submit" className="primary-btn">
                    {isSignup ? 'Sign Up' : 'Login'}
                </button>
            </form>

            <button
                type="button"
                className="link-button"
                onClick={() => {
                    setIsSignup(!isSignup);
                    setError('');
                }}
           >
                {isSignup
                    ? 'Already have an account? Login'
                    : "Don't have an account? Sign Up"}
            </button>
        </div>
    );
}

export default Login;
