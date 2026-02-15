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
    /*
    e = event object. When user types in input, browser creates an event. React passes that event into this function.
    ... Spread operator. Means: Copy all properties of formData into this new object.
    e.target : The element that triggered the event.
    e.target.name : The value of the input's name attribute.
    Example: if <input name="username" /> Then:  e.target.name === "username"
    */
    const handleChange = (e) => { 
        setFormData({...formData, [e.target.name] : e.target.value });
    };
    
    /*
    fetch(url, options) : url → where to send request, options → how to send request . It returns a Promise that resolves to a Response object.
    In App.jsx, you had: <Login onLogin={handleLogin} /> That means: Pass the function handleLogin into the Login component And inside Login, call it onLogin
    */
    
    const handleSubmit = async (e) => {
        // Implement logic here  
        e.preventDefault();
        setError('');  // clears previous error message. Set error state to empty string.
        console.log("Submitting form: ", formData);

        const endpoint = isSignup ? 'http://localhost:4000/signup' : 'http://localhost:4000/login';
        try {
            const res = await fetch(endpoint, {
                method : 'POST', //send data to backend
                headers : {
                    'Content-type' : 'application/json'
                },
                credentials : 'include',
                body : JSON.stringify(formData) //https req body must be a string or binary data, so we stringify our json data
            });

            const data = await res.json();
            if(!res.ok) {
                console.error("Authentication failed: ",data);
                setError(data.message || 'Something went wrong');
                return;
            }
            console.log("Authentication success:",data);
            onLogin(data);
        }
        catch (err) {
            console.error("Server error:",err);
            setError('Server error. please try again.');
        }
    };

    return (
       <div className="login-container">
        <h2>{isSignup ? 'Create Account' : 'Login'}</h2>
        {error && <p style={{color:'red'}}> {error}</p>}

        <form onSubmit={handleSubmit}>
            <input type="text" name="username" placeholder="Username" value={formData.username} onChange={handleChange} required />
            {isSignup &&   <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required/>}
            <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required/>
            <button type="submit"> {isSignup? 'Sign Up':'Login'} </button>
        </form>

        <p> {isSignup? "Already have an account?": "Need an account?"}
        <button onClick={()=> setIsSignup(!isSignup)}>{isSignup? 'Login': 'Sign up'}</button> 
        </p>

       </div>
    );
}

export default Login;
