import React, { useState, useEffect } from "react";
import { Player } from '@lottiefiles/react-lottie-player';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import Header from '../components/Header';
import Navbar from '../components/Navbar';
import Footer from '../components/footer';

const Home = () => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate(); // Initialize useNavigate

    useEffect(() => {
        // Get user info from localStorage or other source
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const handleProvideDetailsClick = () => {
        navigate('/form'); // Redirect to /form
    };

    return (
        <>
            <style>{`
                * {
                    box-sizing: border-box;
                }
                html, body, #root {
                    margin: 0;
                    padding: 0;
                    height: 100%;
                    width: 100%;
                    /* Deeper, more sophisticated gradient */
                    background: linear-gradient(135deg, #001f27, #000a12, #001f27);
                    font-family: 'Montserrat', sans-serif;
                    color: #eee;
                    overflow-x: hidden; /* Prevent horizontal scroll */
                }
                .page-wrapper {
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    background-color: transparent; /* Ensure gradient from body shows */
                }
                .hero {
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                    justify-content: space-between;
                    width: 100%;
                    max-width: 1200px;
                    padding: 80px 30px; /* Increased padding for more breathing room */
                    gap: 60px; /* Increased gap */
                    flex-wrap: wrap; /* Allow wrapping on smaller screens */
                }
                .hero-content {
                    flex: 1;
                    min-width: 300px; /* Ensure content doesn't get too squished */
                    text-align: left; /* Default text alignment */
                }
                .hero h1 {
                    font-size: 3.2rem; /* Larger for impact */
                    color: #00fff7;
                    text-shadow: 0 0 15px rgba(0, 255, 247, 0.7); /* Stronger glow */
                    margin-bottom: 25px; /* More spacing */
                    line-height: 1.2;
                }
                .hero p {
                    font-size: 1.2rem; /* Slightly larger, easier to read */
                    line-height: 1.8;
                    color: #cfcfcf; /* Softer white */
                    max-width: 600px; /* Control line length for readability */
                    margin-bottom: 30px; /* Add margin below paragraph for button */
                }
                .hero-animation {
                    flex: 1;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-width: 300px; /* Ensure animation has space */
                }
                .hero-animation > div {
                    width: 100%;
                    max-width: 450px; /* Slightly larger animation */
                    height: 450px;
                }
                .features {
                    width: 100%;
                    max-width: 1200px;
                    padding: 60px 30px; /* More padding */
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); /* Slightly larger cards */
                    gap: 35px; /* More space between cards */
                }
                .feature-card {
                    background: rgba(31, 31, 31, 0.85); /* Slightly darker, more opaque */
                    border-radius: 20px; /* More rounded */
                    padding: 30px; /* More padding */
                    box-shadow:
                        0 6px 20px rgba(0, 255, 255, 0.25), /* Stronger shadow */
                        inset 0 0 12px rgba(0, 255, 255, 0.15); /* Stronger inner glow */
                    transition: transform 0.4s ease-out, box-shadow 0.4s ease-out, background 0.4s ease-out;
                    color: #e0fafa; /* Lighter teal for text */
                    cursor: pointer;
                    transform-style: flat; /* Simpler 2D transform for smoothness */
                    user-select: none;
                    border: 1px solid rgba(0, 255, 247, 0.3); /* Subtle border */
                }
                .feature-card:hover {
                    transform: translateY(-10px) scale(1.03); /* Lift and slightly enlarge */
                    box-shadow:
                        0 18px 45px rgba(0, 255, 255, 0.5), /* Much stronger shadow */
                        inset 0 0 25px rgba(0, 255, 255, 0.4); /* Stronger inner glow */
                    background: rgba(45, 45, 45, 0.95); /* More opaque on hover */
                    z-index: 10;
                }
                .feature-card h3 {
                    color: #00fff7;
                    margin-bottom: 15px; /* More space */
                    font-size: 1.5rem; /* Larger heading */
                    text-shadow: 0 0 8px rgba(0, 255, 247, 0.4);
                }
                .feature-card p {
                    color: #c0c0c0; /* Softer text color */
                    font-size: 1rem; /* Clearer body text */
                    line-height: 1.7;
                }
                /* New button style */
                .detail-button {
                    background-color: #00fff7;
                    color: #002b36; /* Dark text for contrast */
                    border: none;
                    padding: 12px 28px;
                    border-radius: 30px;
                    font-size: 1.1rem;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 5px 15px rgba(0, 255, 247, 0.4);
                }
                .detail-button:hover {
                    background-color: #00e6e0;
                    transform: translateY(-3px);
                    box-shadow: 0 8px 20px rgba(0, 255, 247, 0.6);
                }
                @media (max-width: 900px) {
                    .hero {
                        flex-direction: column;
                        text-align: center;
                        padding: 40px 20px;
                    }
                    .hero h1 {
                        font-size: 2.5rem;
                    }
                    .hero p {
                        font-size: 1rem;
                    }
                    .hero-animation > div {
                        max-width: 300px;
                        height: 300px;
                    }
                    .features {
                        padding: 40px 20px;
                        grid-template-columns: 1fr; /* Stack cards on small screens */
                    }
                    .feature-card {
                        padding: 20px;
                    }
                    .feature-card h3 {
                        font-size: 1.3rem;
                    }
                }
            `}</style>

            <div className="page-wrapper">
                <Header />
                <Navbar user={user}/>

                <div className="hero">
                    <div className="hero-content">
                        <h1>Your AI-Powered Diabetes Health Companion</h1>
                        <p>
                            Revolutionizing diabetes management for patients and doctors. Our cutting-edge system leverages **Raspberry Pi integration** and **advanced machine learning** to provide personalized insights, predict risks, and offer tailored recommendations, especially for elderly and pregnant women.
                            Take control of your health journey with smarter, more informed decisions.
                        </p>
                        {/* New button added here */}
                        <button className="detail-button" onClick={handleProvideDetailsClick}>
                            Provide Details for Detailed Analytics
                        </button>
                    </div>
                    <div className="hero-animation">
                        {/* More relevant Lottie animation for health monitoring/data */}
                        <Player
                            autoplay
                            loop
                            src="https://assets7.lottiefiles.com/packages/lf20_0yfsb3a1.json"
                            style={{ height: '100%', width: '100%' }}
                        />
                    </div>
                </div>

                <div className="features">
                    <div className="feature-card">
                        <h3>Seamless Glucose Tracking</h3>
                        <p>
                            Integrates effortlessly with commercial glucometers, **automatically capturing real-time blood sugar data** without the need for manual entries.
                        </p>
                    </div>
                    <div className="feature-card">
                        <h3>Secure Cloud Accessibility</h3>
                        <p>
                            All your glucose data is stored securely in the cloud, enabling **doctors and caretakers to access vital health information remotely**, anytime, anywhere.
                        </p>
                    </div>
                    <div className="feature-card">
                        <h3>Predictive AI Analytics</h3>
                        <p>
                            Our powerful **machine learning models analyze your glycemic trends** to predict future patterns and offer intelligent suggestions for insulin management and lifestyle adjustments.
                        </p>
                    </div>
                    <div className="feature-card">
                        <h3>Intuitive Health Dashboard</h3>
                        <p>
                            Visualize your health journey with **clear, interactive graphs and reports**. Our user-friendly web interface empowers you with insights for better decision-making.
                        </p>
                    </div>
                    <div className="feature-card">
                        <h3>Affordable & Portable Care</h3>
                        <p>
                            Designed to be both **cost-effective and highly portable**, making advanced diabetes monitoring accessible, particularly for pregnant women in diverse settings.
                        </p>
                    </div>
                    <div className="feature-card">
                        <h3>Holistic Digital Health Solutions</h3>
                        <p>
                            We bridge the gap between traditional monitoring and **AI-driven digital health**, providing scalable, comprehensive remote care for chronic conditions.
                        </p>
                    </div>
                </div>
                <Footer/>
            </div>
        </>
    );
};

export default Home;