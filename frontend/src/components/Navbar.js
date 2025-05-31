import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa';

const Navbar = ({ user }) => {
  console.log("Navbar: Received user prop:", user); // <--- ADD THIS LINE
    console.log("Navbar: user.name value:", user?.name);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userPanelOpen, setUserPanelOpen] = useState(false);
  const [navbarHeight, setNavbarHeight] = useState(60);
  const navbarRef = useRef(null);
  const navigate = useNavigate();

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);
  const toggleUserPanel = () => setUserPanelOpen(!userPanelOpen);
  const closeUserPanel = () => setUserPanelOpen(false);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  useEffect(() => {
    if (navbarRef.current) {
      setNavbarHeight(navbarRef.current.offsetHeight);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.user-panel') && !e.target.closest('.user-icon')) {
        setUserPanelOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <style>{`
        .navbar {
          position: sticky;
          top: 0;
          width: 100%;
          background: #121212;
          box-sizing: border-box;
          height: auto;
          font-family: 'Montserrat', sans-serif;
          user-select: none;
          z-index: 1000;
          box-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
          padding: 0 20px;
        }
        .nav-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 60px;
        }
        .nav-menu {
          display: flex;
          list-style: none;
          gap: 24px;
        }
        .nav-link {
          color: #bbb;
          text-decoration: none;
          font-weight: 600;
          font-size: 1rem;
          padding: 8px 12px;
          border-radius: 6px;
          transition: all 0.3s ease;
        }
        .nav-link:hover,
        .nav-link.active {
          color: #00fff7;
          text-shadow: 0 0 8px #00fff7;
          background: rgba(0, 255, 255, 0.1);
        }
        .menu-toggle {
          display: none;
          flex-direction: column;
          cursor: pointer;
        }
        .bar {
          height: 3px;
          width: 25px;
          background-color: #00fff7;
          margin: 4px 0;
          border-radius: 2px;
          transition: 0.3s ease;
        }
        .user-icon {
          color: #00fff7;
          padding: 8px;
          font-size: 1.5rem;
          cursor: pointer;
          margin-left: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 40px;
          width: 40px;
          border-radius: 50%;
          background: rgba(0, 255, 255, 0.1);
          transition: background 0.3s;
        }
        .user-icon:hover {
          background: rgba(0, 255, 255, 0.2);
        }
        .user-panel {
          position: fixed;
          top: 160px;
          right: -300px;
          width: 280px;
          height: calc(100% - 60px);
          background: #1f1f1f;
          box-shadow: -2px 0 10px rgba(0, 255, 255, 0.3);
          color: #bbb;
          padding: 20px;
          overflow-y: auto;
          transition: right 0.3s ease;
          z-index: 1500;
          opacity: 1;
          border-top-left-radius: 10px;
          border-bottom-left-radius: 10px;
        }
        .user-panel.open {
          right: 20px;
        }
        .user-panel h2 {
          color: #00fff7;
          margin-bottom: 10px;
        }
        .user-panel p {
          margin: 8px 0;
        }
        .user-panel .close-btn {
          color: #00fff7;
          font-size: 1.5rem;
          cursor: pointer;
          position: absolute;
          top: 15px;
          right: 20px;
        }
        .logout-btn {
          display: inline-block;
          margin-top: 20px;
          padding: 10px 15px;
          background: #ff4c4c;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-weight: bold;
          transition: background 0.3s ease;
        }
        .logout-btn:hover {
          background: #e63946;
        }
        @media (max-width: 768px) {
          .nav-menu {
            position: fixed;
            top: ${navbarHeight}px;
            right: 0;
            background: #1f1f1f;
            height: calc(100% - ${navbarHeight}px);
            width: 220px;
            flex-direction: column;
            padding-top: 30px;
            transform: translateX(100%);
            transition: transform 0.3s ease-in-out;
            box-shadow: -5px 0 15px rgba(0, 255, 255, 0.3);
            gap: 20px;
            z-index: 999;
          }
          .nav-menu.open {
            transform: translateX(0);
          }
          .menu-toggle {
            display: flex;
          }
        }
      `}</style>

      <nav className="navbar" ref={navbarRef}>
        <div className="nav-container">
          <ul className={`nav-menu ${menuOpen ? 'open' : ''}`}>
            {['home', 'about', 'contact', 'dashboard', 'report'].map((link) => (
              <li key={link}>
                <NavLink
                  to={`/${link}`}
                  className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                  onClick={closeMenu}
                >
                  {link.charAt(0).toUpperCase() + link.slice(1)}
                </NavLink>
              </li>
            ))}
          </ul>

          <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
            <FaUserCircle className="user-icon" onClick={toggleUserPanel} />
            <button
              className="menu-toggle"
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
              onClick={toggleMenu}
            >
              <span className="bar" />
              <span className="bar" />
              <span className="bar" />
            </button>
          </div>
        </div>
      </nav>

      <div className={`user-panel ${userPanelOpen ? 'open' : ''}`}>
  <span className="close-btn" onClick={closeUserPanel}>&times;</span>
  <h2>User Details</h2>
  <p><strong>Name:</strong> {user?.name || 'Guest'}</p>

  <p><strong>Email:</strong> {user?.email || 'Not Provided'}</p>
  <p><strong>Gender:</strong> {user?.gender || 'Not Provided'}</p>
  <p><strong>Age:</strong> {user?.age?.$numberInt || user?.age || 'Not Provided'}</p>
  <p><strong>Weight:</strong> {user?.weight?.$numberInt || user?.weight || 'Not Provided'}</p>
  <p><strong>Height:</strong> {user?.height?.$numberInt || user?.height || 'Not Provided'}</p>

  <button className="logout-btn" onClick={handleLogout}>Logout</button>
</div>


    </>
  );
};

export default Navbar;
