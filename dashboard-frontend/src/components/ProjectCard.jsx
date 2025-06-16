import React from 'react';
import { useNavigate } from 'react-router-dom';

function ProjectCard({ project }) {
  const navigate = useNavigate();

  const handleViewProject = () => {
    navigate(`/projects/${project.id}`);
  };

  return (
    <div style={styles.card}>
      <h2 style={styles.title}>{project.name}</h2>

      <p style={styles.text}><strong>Current Task:</strong> {project.currentTask}</p>
      <p style={styles.text}><strong>Completion:</strong> {project.completionPercentage}%</p>

      <div style={styles.progressBarContainer}>
        <div style={{ ...styles.progressBarFill, width: `${project.completionPercentage}%` }}></div>
      </div>

      <button onClick={handleViewProject} style={styles.button}>View Project</button>
    </div>
  );
}

const styles = {
  card: { backgroundColor: '#F1F6F9', padding: '25px', borderRadius: '10px', boxShadow: '0px 4px 12px rgba(0,0,0,0.1)' },
  title: { color: '#0A2647', marginBottom: '15px', fontSize: '1.5rem' },
  text: { color: '#333', marginBottom: '10px' },
  button: { marginTop: '20px', padding: '10px 20px', backgroundColor: '#144272', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' },
  progressBarContainer: { width: '100%', height: '10px', backgroundColor: '#dcdcdc', borderRadius: '5px', marginBottom: '10px' },
  progressBarFill: { height: '10px', backgroundColor: '#0A2647', borderRadius: '5px', transition: 'width 0.3s ease' }
};

export default ProjectCard;
