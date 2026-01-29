import React, { useState } from 'react';
import { Form, Button, Card } from 'react-bootstrap';

// Add this at the top of Auth.jsx
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";



function Auth({ onLogin }) {
  const [isSignup, setIsSignup] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault(); // Stops the page from refreshing
    
    const endpoint = isSignup ? 'signup' : 'login';
    const response = await fetch(`${API_URL}/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (response.ok) {
      if (isSignup) {
        alert("Account created! Now please login.");
        setIsSignup(false); // Switch to login view
      } else {
        // We got the token! Pass it to App.jsx
        onLogin(data.access_token);
      }
    } else {
      alert(data.detail || "Something went wrong");
    }
  };

  return (
    <Card className="p-4 shadow">
      <h2 className="text-center mb-4">{isSignup ? "Create Account" : "Welcome Back"}</h2>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Username</Form.Label>
          <Form.Control 
            type="text" 
            placeholder="Enter username" 
            value={username} // Links the box to our variable
            onChange={(e) => setUsername(e.target.value)} // Updates variable when typing
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Password</Form.Label>
          <Form.Control 
            type="password" 
            placeholder="Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Form.Group>

        <Button variant="primary" type="submit" className="w-100 mb-3">
          {isSignup ? "Register" : "Login"}
        </Button>
        
        <div className="text-center">
          <Button variant="link" onClick={() => setIsSignup(!isSignup)}>
            {isSignup ? "Already have an account? Login" : "Don't have an account? Sign Up"}
          </Button>
        </div>
      </Form>
    </Card>
  );
}

export default Auth;