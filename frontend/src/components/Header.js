import React from 'react';

const Header = () => {
  return (
    <>
      <style>{`
        .header-container {
          width: 100%;
          box-sizing: border-box;
          text-align: center;
          margin: 0;
          padding: 16px 20px;
          background: linear-gradient(135deg, #0f2027, #203a43, #2c5364);
          box-shadow: 0 0 15px #00fff7aa;
        }
        .header-title {
          font-family: 'Montserrat', sans-serif;
          font-weight: 900;
          font-size: 1.8rem;
          color: #00fff7;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          text-shadow:
            0 0 4px #00fff7,
            0 0 8px #00b7f7,
            0 0 4px #00fff7,
            0 0 80px #00b7f7;
          animation: glowPulse 3s ease-in-out infinite alternate;
          margin: 0;
        }

        @keyframes glowPulse {
          0% {
            text-shadow:
              0 0 4px #00fff7,
              0 0 8px #00b7f7,
              0 0 15px #00fff7,
              0 0 30px #00b7f7;
          }
          100% {
            text-shadow:
              0 0 8px #00b7f7,
              0 0 15px #00fff7,
              0 0 22px #00b7f7,
              0 0 40px #00fff7;
          }
        }

        .header-subtitle {
          color: #66f9ffcc;
          font-weight: 600;
          font-size: 1rem;
          margin-top: -6px;
          margin-bottom: 0;
        }
      `}</style>

      <header className="header-container">
        <h1 className="header-title">Glucolytix</h1><br/>
        <p className="header-subtitle">Your Health, Our Priority</p>
      </header>
    </>
  );
};

export default Header;
