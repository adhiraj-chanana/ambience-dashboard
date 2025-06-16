import React, { useState, useEffect } from 'react';
import api from '../api';
import ProjectCard from '../components/ProjectCard';
import Navbar from '../components/Navbar';

function Projects() {
  const [projects, setProjects] = useState([]);
  const [newProjectName, setNewProjectName] = useState("");

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await api.get("/projects/");
      console.log("Raw API response:", response.data);
      const data = response.data.map(project => {
        const pendingTasks = project.tasks.filter(task => task.status !== "Completed");
        const nextTask = pendingTasks.length > 0 ? pendingTasks[0].name : "All tasks completed!";
        return {
          id: project.id,
          name: project.name,
          tasks: project.tasks,
          currentTask: nextTask
        };
      });
      console.log("Processed projects:", data);
      setProjects(data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const handleAddProject = async () => {
    if (!newProjectName.trim()) return;
    try {
      await api.post(`/projects/?name=${newProjectName}`);
      setNewProjectName("");
      fetchProjects();
    } catch (error) {
      console.error("Error adding project:", error);
    }
  };

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        <h1 style={styles.heading}>Projects</h1>

        <div style={styles.addForm}>
          <input 
            type="text"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            placeholder="Enter new project name"
            style={styles.input}
          />
          <button onClick={handleAddProject} style={styles.button}>Add Project</button>
        </div>

        <div style={styles.grid}>
        {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
        ))}
        </div>
      </div>
    </>
  );
}

const styles = {
  container: { maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' },
  heading: { color: '#0066b3', fontSize: '2rem', marginBottom: '30px' },
  addForm: { display: 'flex', justifyContent: 'center', marginBottom: '30px', gap: '20px' },
  input: { padding: '10px', fontSize: '1rem', width: '300px' },
  button: { padding: '10px 20px', fontSize: '1rem', backgroundColor: '#0066b3', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }
};

export default Projects;
