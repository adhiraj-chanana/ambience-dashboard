import React, { useState, useEffect } from 'react';
import api from '../api';

function Analytics() {
  const [projects, setProjects] = useState([]);

  const fetchProjects = async () => {
    try {
      const response = await api.get("/projects/");
      setProjects(response.data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const calculateProgress = (tasks) => {
    if (!tasks?.length) return 0;
    const completed = tasks.filter(task => task.status === "Completed").length;
    const total = tasks.length;
    return Math.round((completed / total) * 100);
  };

  return (
    <div style={styles.container}>
      <h1>Analytics Dashboard</h1>

      {projects.map(project => {
        const progress = calculateProgress(project.tasks);

        return (
          <div key={project.id} style={styles.card}>
            <h3>{project.name}</h3>
            <p>Progress: {progress}%</p>

            <div style={styles.progressContainer}>
              <div style={{ ...styles.progressBar, width: `${progress}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

const styles = {
  container: { maxWidth: '700px', margin: '0 auto', paddingTop: '50px' },
  card: { marginBottom: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' },
  progressContainer: {
    height: '20px',
    width: '100%',
    backgroundColor: '#eee',
    borderRadius: '5px',
    marginTop: '10px'
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#2196f3',
    borderRadius: '5px'
  }
};

export default Analytics;
