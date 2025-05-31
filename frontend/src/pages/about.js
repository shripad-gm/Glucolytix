import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Lottie from "lottie-react";
import Header from "../components/Header";
import Navbar from "../components/Navbar";
import Footer from "../components/footer";

export default function AboutUs() {
  const [animationData, setAnimationData] = useState(null);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    fetch("https://assets8.lottiefiles.com/packages/lf20_tutvdkg0.json")
      .then((res) => res.json())
      .then((data) => setAnimationData(data));
  }, []);

   const [user, setUser] = useState(null);

  useEffect(() => {
    // Get user info from localStorage or other source
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleFlip = () => {
    setIsFlipped((prev) => !prev);
  };

  if (!animationData)
    return (
      <div style={styles.loadingWrapper}>
        <p style={styles.loadingText}>Loading animation...</p>
      </div>
    );

  return (
    <>
      <style>{`
        * {
          box-sizing: border-box;
        }
        html, body, #root {
          margin: 0; padding: 0; height: 100%; width: 100%;
          background: linear-gradient(135deg, #0f2027, #203a43, #2c5364);
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          color: #00ffc8;
          overflow-x: hidden;
        }
        .page-wrapper {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .flip-container {
          perspective: 1200px;
          width: 100%;
          max-width: 900px;
          height: 450px;
          margin-top: 50px;
          cursor: pointer;
        }
        .flip-card {
          width: 100%;
          height: 100%;
          position: relative;
          transform-style: preserve-3d;
        }
        .flip-card-face {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 12px 30px rgba(0, 255, 200, 0.25);
          padding: 30px;
          transition: transform 0.8s;
        }
        .flip-card-front {
          background: linear-gradient(135deg, rgba(0, 255, 200, 0.1), rgba(0, 255, 200, 0.05));
          display: flex;
          flex-direction: row;
          gap: 30px;
          align-items: center;
          justify-content: space-between;
        }
        .flip-card-back {
          background: linear-gradient(135deg, rgba(0, 255, 200, 0.2), rgba(0, 255, 200, 0.1));
          transform: rotateY(180deg);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          color: #00ffc8;
          font-size: 1.1rem;
          padding: 30px;
        }
        .about-text {
          max-width: 400px;
          text-shadow: 0 0 8px rgba(0, 255, 200, 0.5);
        }
        .about-text h1 {
          font-size: 2.5rem;
          margin-bottom: 15px;
          color: #00ffc8;
        }
        .about-text p {
          font-size: 1.1rem;
          line-height: 1.6;
          color: #ccffee;
        }
        .about-text p strong {
          color: #00ffc8;
        }
        .team-members {
          margin-top: 20px;
          display: flex;
          gap: 15px;
          flex-wrap: wrap;
          justify-content: center;
        }
        .team-member {
          padding: 12px 18px;
          background: rgba(0, 255, 200, 0.15);
          border-radius: 12px;
          font-weight: bold;
          font-size: 1rem;
          color: #00ffc8;
          text-shadow: 0 0 6px #00ffc8aa;
          transition: transform 0.3s, box-shadow 0.3s;
        }
        .team-member:hover {
          transform: scale(1.1) rotate(3deg);
          box-shadow: 0 0 15px #00ffc8cc;
        }
        .about-animation {
          width: 280px;
          height: 280px;
          border-radius: 18px;
          overflow: hidden;
          filter: drop-shadow(0 0 12px #00ffc8aa);
          transition: transform 0.5s ease;
        }
        .about-animation:hover {
          transform: scale(1.05);
        }
        @media (max-width: 800px) {
          .flip-card-front {
            flex-direction: column;
            align-items: center;
            text-align: center;
          }
          .about-text {
            max-width: 100%;
          }
        }
      `}</style>

      <div className="page-wrapper">
        <Header />
        <Navbar user={user}/>

        <div className="flip-container" onClick={handleFlip}>
          <motion.div
            className="flip-card"
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Front Side */}
            <div className="flip-card-face flip-card-front">
              <div className="about-text">
                <h1>About Us</h1>
                <p>
                  We specialize in <strong>smart, automated blood glucose monitoring</strong> for elderly and pregnant women. 
                  Combining <strong>Raspberry Pi microcontroller</strong> and <strong>Machine Learning</strong>, we deliver healthcare insights at your fingertips.
                </p>
                <div className="team-members">
                  <div className="team-member">Shripad Maradi</div>
                  <div className="team-member">Samartha KB</div>
                  <div className="team-member">Navya Hebbar</div>
                </div>
              </div>

              <div className="about-animation">
                <Lottie animationData={animationData} loop={true} />
              </div>
            </div>

            {/* Back Side */}
            <div className="flip-card-face flip-card-back">
              <h2 style={{ fontSize: "2rem", marginBottom: "15px" }}>Our Mission</h2>
              <p style={{ marginBottom: "10px" }}>Establishes a direct connection between a commercial glucometer and Raspberry Pi for continuous glucose tracking without manual input</p>
              <p style={{ marginBottom: "10px" }}>Utilizes cloud-based storage to enable real-time remote access to glucose data by healthcare providers and caretakers.</p>
              <p style={{ fontStyle: "italic", opacity: 0.9 }}>Integrates machine learning algorithms for personalized analysis, prediction of glycemic trends, and smart insulin management suggestions.</p>
            </div>
          </motion.div>
        </div>
        <Footer/>
      </div>
    </>
  );
}

const styles = {
  loadingWrapper: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#000a12",
    color: "#00ffc8",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  loadingText: {
    fontSize: "1.3rem",
  },
};
