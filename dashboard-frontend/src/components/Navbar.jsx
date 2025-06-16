import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';

function Navbar() {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div style={styles.navbar}>
      <div style={styles.logoSection}>
        <img src="/logo.png" alt="Ambience Airtech" style={styles.logo} />
        <h1 style={styles.title}>Ambience Airtech</h1>
      </div>

      <div style={styles.links}>
        <Link to="/projects" style={styles.link}>Projects</Link>
        <Link to="/tasks" style={styles.link}>Tasks</Link>
        <Link to="/dashboard" style={styles.link}>Dashboard</Link>
        <Link to="/analytics" style={styles.link}>Analytics</Link>
        <Link to="/ai" style={styles.link}>Ambience AI</Link>
        <button onClick={handleLogout} style={styles.logoutButton}>Logout</button>
      </div>
    </div>
  );
}

const styles = {
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 40px',
    backgroundColor: '#0066b3',
    color: '#fff',
    boxShadow: '0px 2px 5px rgba(0,0,0,0.2)',
  },
  logoSection: {
    display: 'flex',
    alignItems: 'center',
  },
  logo: {
    height: '50px',
    marginRight: '15px',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
  },
  links: {
    display: 'flex',
    alignItems: 'center',
    gap: '30px',
  },
  link: {
    color: '#fff',
    textDecoration: 'none',
    fontWeight: '500',
    fontSize: '1rem',
  },
  logoutButton: { 
    backgroundColor: '#fff',
    color: '#0A2647',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
};

export default Navbar;
