import React, { useState } from 'react';
import { Player } from '@lottiefiles/react-lottie-player';
import axios from 'axios';
import { Link,useNavigate } from 'react-router-dom';
import Header from '../components/Header';

const Login = () => {
  const [form, setForm] = useState({ name: '', password: '' });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  try {
    const response = await axios.post('http://localhost:8000/api/auth/login', form, { withCredentials: true });

    const userData = response.data;

    // Clean the data
    const cleanedUser = {
      ...userData,
      height: userData.height?.$numberInt || userData.height,
      weight: userData.weight?.$numberInt || userData.weight,
      age: userData.age?.$numberInt || userData.age,
    };

    // Store cleaned data in localStorage
    localStorage.setItem('user', JSON.stringify(cleanedUser));

    alert('Login successful!');
    navigate('/home');  // Redirect frontend
  } catch (error) {
    console.error(error);
    alert('Login failed');
  } finally {
    setLoading(false);
  }
};




  return (
    <>
      <style>{`
        * {
          box-sizing: border-box;
        }
        html, body, #root {
          margin: 0; padding: 0;
          height: 100%; width: 100%;
          background: #121212;
          font-family: 'Montserrat', sans-serif;
          color: #eee;
          overflow-x: hidden;
        }
        .page-wrapper {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .container {
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: center;
          width: 100%;
          max-width: 700px;
          background: #1f1f1f;
          border-radius: 12px;
          box-shadow: 0 0 15px rgba(0, 255, 255, 0.2);
          margin: 130px;
          padding: 20px;
        }
        form {
          flex: 1;
          padding: 40px 30px;
          display: flex;
          flex-direction: column;
          min-width: 280px;
        }
        h2 {
          text-align: center;
          margin-bottom: 30px;
          font-weight: 600;
          color: #00fff7;
          text-shadow: 0 0 10px #00fff7;
        }
        input {
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
        }
        input:focus {
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
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
          min-width: 280px;
        }
        .animation-container > div {
          width: 100%;
          max-width: 400px;
          height: auto;
        }
        .register-container {
          text-align: center;
          margin-top: 20px;
          font-size: 1rem;
          color: #bbb;
          user-select: none;
        }
        .register-container a {
          color: #00fff7;
          font-weight: 700;
          text-decoration: none;
          cursor: pointer;
          transition: color 0.3s ease;
          text-shadow: 0 0 6px #00fff7;
        }
        .register-container a:hover {
          color: #00b7f7;
          text-shadow: 0 0 12px #00b7f7;
        }

        @media (max-width: 768px) {
          .container {
            flex-direction: column;
            margin: 20px 10px;
          }
        }
      `}</style>

      <div className="page-wrapper">
        <Header />

        <div className="container">
          <form onSubmit={handleSubmit}>
            <h2>Login</h2>
            <input
              name="name"
              type="text"
              placeholder="Username"
              value={form.name}
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
            <button type="submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>

            <div className="register-container">
              <span>New user?</span>
              <Link to="/register">REGISTER</Link>
            </div>
          </form>

          <div className="animation-container">
            <Player
              autoplay
              loop
              src="https://assets7.lottiefiles.com/packages/lf20_0yfsb3a1.json"
              style={{ height: '300px', width: '300px' }}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
