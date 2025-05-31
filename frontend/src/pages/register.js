import React, { useState } from 'react';
import { Player } from '@lottiefiles/react-lottie-player';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Header from '../components/Header';

const Register = () => {
  const [form, setForm] = useState({
    name: '', email: '', password: '', gender: '', height: '', weight: '', age: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:8000/api/auth/signup', form);
      alert('Registration successful!');
      console.log('Response:', response.data);

      // Save user data (without password) to localStorage
      const userInfo = { 
        name: form.name, 
        email: form.email, 
        gender: form.gender, 
        height: form.height, 
        weight: form.weight, 
        age: form.age 
      };
      localStorage.setItem('userInfo', JSON.stringify(userInfo));

      setForm({
        name: '', email: '', password: '', gender: '', height: '', weight: '', age: ''
      });
    } catch (error) {
      console.error('Registration error:', error);
      alert(error.response?.data?.error || error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />

      <style>{`
        body, html, #root {
          margin: 0; 
          height: 100%; 
          background: #121212; 
          font-family: 'Montserrat', sans-serif;
          color: #eee;
        }

        .page-wrapper {
          height: calc(100vh - 60px);
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 0 20px;
        }

        .container {
          display: flex;
          max-width: 900px;
          width: 100%;
          background: #1f1f1f;
          border-radius: 12px;
          box-shadow: 0 0 15px rgba(0, 255, 255, 0.2);
          overflow: hidden;
        }

        form {
          flex: 1;
          padding: 40px 30px;
          display: flex;
          flex-direction: column;
        }

        h2 {
          text-align: center; 
          margin-bottom: 30px;
          font-weight: 600; 
          color: #00fff7;
          text-shadow: 0 0 10px #00fff7;
        }

        input, select {
          background: #2a2a2a; 
          border: none; 
          border-radius: 8px;
          padding: 14px 18px; 
          margin-bottom: 20px; 
          color: #eee;
          font-size: 1rem; 
          outline: none;
          box-shadow: inset 0 0 8px #00fff7;
          transition: 0.3s ease;
          appearance: none;
          cursor: pointer;
        }

        input:focus, select:focus {
          box-shadow: 0 0 8px 2px #00fff7;
          background: #161616;
        }

        button {
          background: linear-gradient(90deg, #00fff7, #00b7f7);
          border: none; 
          border-radius: 8px;
          padding: 15px; 
          color: #121212;
          font-weight: 600; 
          font-size: 1.1rem;
          cursor: pointer;
          box-shadow: 0 0 10px #00b7f7;
          transition: background 0.3s ease, color 0.3s ease;
        }

        button:hover:not(:disabled) {
          background: #00b7f7;
          color: #fff;
          box-shadow: 0 0 15px #00fff7;
        }

        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          box-shadow: none;
        }

        .animation-container {
          flex: 1; 
          background: #121212;
          display: flex; 
          justify-content: center; 
          align-items: center;
          padding: 20px;
        }

        .animation-container > div {
          width: 100%; 
          max-width: 400px;
          height: auto;
        }

        .login-link {
          margin-top: 15px;
          text-align: center;
          font-size: 0.95rem;
          color: #ccc;
          user-select: none;
        }

        .login-link a {
          color: #00fff7;
          font-weight: 600;
          text-decoration: none;
          margin-left: 5px;
          transition: color 0.3s ease;
        }

        .login-link a:hover {
          color: #00b7f7;
          text-decoration: underline;
        }
      `}</style>

      <div className="page-wrapper">
        <div className="container">
          <form onSubmit={handleSubmit}>
            <h2>Create Account</h2>
            <input 
              name="name" 
              placeholder="Full Name" 
              value={form.name} 
              onChange={handleChange} 
              required 
              disabled={loading} 
            />
            <input 
              name="email" 
              type="email" 
              placeholder="Email" 
              value={form.email} 
              onChange={handleChange} 
              required 
              disabled={loading} 
            />
            <input 
              name="password" 
              type="password" 
              placeholder="Password" 
              value={form.password} 
              onChange={handleChange} 
              required 
              disabled={loading} 
            />
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              disabled={loading}
              required
            >
              <option value="" disabled>Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            <input 
              name="height" 
              type="number" 
              placeholder="Height (cm)" 
              value={form.height} 
              onChange={handleChange} 
              disabled={loading} 
            />
            <input 
              name="weight" 
              type="number" 
              placeholder="Weight (kg)" 
              value={form.weight} 
              onChange={handleChange} 
              disabled={loading} 
            />
            <input 
              name="age" 
              type="number" 
              placeholder="Age" 
              value={form.age} 
              onChange={handleChange} 
              disabled={loading} 
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Registering...' : 'Register'}
            </button>

            <div className="login-link">
              Already have an account? 
              <Link to="/login">LOGIN</Link>
            </div>
          </form>

          <div className="animation-container">
            <Player
              autoplay
              loop
              src="https://assets10.lottiefiles.com/packages/lf20_jcikwtux.json"
              style={{ height: '400px', width: '400px' }}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;
