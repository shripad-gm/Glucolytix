import React from "react";

export default function Footer() {
  return (
    <>
      <style>{`
        .footer {
          position: relative;
          width: 100vw;
          height: 150px;
          overflow: hidden;
          background: transparent; /* Remove the background color */
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          color: #00fff7;
          user-select: none;
        }

        svg {
          display: block;
          width: 100vw;
          height: 150px;
          position: relative;
          overflow: visible;
        }

        path {
          animation: waveShift 6s ease-in-out infinite alternate;
        }

        @keyframes waveShift {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-20px);
          }
        }

        .footer-text {
          position: absolute;
          top: 120px;
          left: 50%;
          transform: translateX(-50%);
          width: 90%;
          text-align: center;
          font-size: 14px;
          font-weight: 700;
          text-shadow:
            0 0 6px #00fff7,
            0 0 12px #00b7f7;
          pointer-events: none;
          letter-spacing: 0.05em;
          z-index: 1;
        }
      `}</style>

      <footer className="footer" aria-label="Footer with wavy background and centered text">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            fill="#00fff7"
            fillOpacity="0.15"
            d="M0,64L30,80C60,96,120,128,180,133.3C240,139,300,117,360,106.7C420,96,480,96,540,128C600,160,660,224,720,234.7C780,245,840,203,900,181.3C960,160,1020,160,1080,165.3C1140,171,1200,181,1260,176C1320,171,1380,149,1410,138.7L1440,128L1440,320L0,320Z"
          />
        </svg>

        <div className="footer-text">
          2025 |@Glucolytix All Rights Reserved 
        </div>
      </footer>
    </>
  );
}
