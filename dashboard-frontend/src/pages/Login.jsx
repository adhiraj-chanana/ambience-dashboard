import React, { useState, useContext } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      const response = await api.post('/login', { username, password });
      login(response.data.access_token);
      navigate('/projects');
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Ambience Dashboard Login</h1>
      <div style={styles.form}>
        <input 
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={styles.input}
        />
        <input 
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />
        <button onClick={handleLogin} style={styles.button}>Login</button>
        {error && <p style={styles.error}>{error}</p>}
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '100px' },
  heading: { fontSize: '2rem', color: '#0A2647', marginBottom: '40px' },
  form: { display: 'flex', flexDirection: 'column', gap: '20px', width: '400px' },
  input: { padding: '12px', fontSize: '1rem', border: '1px solid #ccc', borderRadius: '5px' },
  button: { padding: '12px', backgroundColor: '#0A2647', color: 'white', border: 'none', borderRadius: '5px', fontSize: '1rem', cursor: 'pointer' },
  error: { color: 'red', marginTop: '10px' }
};

export default Login;
