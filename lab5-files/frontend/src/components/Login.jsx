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
        // Implement logic here
    };

    return (
        <>
            {/*
              TODO: Implement JSX for Login / Signup page
              - Username input
              - Password input
              - Email input (only for signup)
              - Error message display
              - Submit button
              - Toggle between Login and Signup
            */}
        </>
    );
}

export default Login;
