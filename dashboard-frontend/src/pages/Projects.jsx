import React, { useState, useEffect } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

function Projects() {
  const [projects, setProjects] = useState([]);
  const [newProjectName, setNewProjectName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await api.get("/projects/");
      setProjects(res.data);
    } catch (err) {
      console.error("Error fetching projects:", err);
    }
  };

  const handleAddProject = async () => {
    if (!newProjectName.trim()) return;
    try {
      await api.post(`/projects/?name=${newProjectName}`);
      setNewProjectName("");
      fetchProjects();
    } catch (err) {
      console.error("Error adding project:", err);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Projects</h1>

      <div style={styles.form}>
        <input
          type="text"
          placeholder="Enter new project name"
          value={newProjectName}
          onChange={(e) => setNewProjectName(e.target.value)}
          style={styles.input}
        />
        <button onClick={handleAddProject} style={styles.button}>
          Add Project
        </button>
      </div>

      <div style={styles.grid}>
        {projects.map((project) => {
          const completed = project.tasks.filter((t) => t.status === "Completed").length;
          const total = project.tasks.length;
          const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
          const currentTask = project.tasks.find((t) => t.status !== "Completed");

          return (
            <div key={project.id} style={styles.card}>
              <h3 style={styles.projectTitle}>{project.name}</h3>
              <p><strong>Current Task:</strong> {currentTask ? currentTask.name : "All Completed"}</p>
              <p><strong>Completion:</strong> {progress}%</p>

              <div style={styles.progressBarContainer}>
                <div style={{ ...styles.progressBarFill, width: `${progress}%` }} />
              </div>

              <button
                onClick={() => navigate(`/projects/${project.id}`)}
                style={styles.viewButton}
              >
                View Project
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: "1200px", margin: "0 auto", padding: "40px 20px" },
  heading: { fontSize: "2.2rem", marginBottom: "30px", color: "#004080" },
  form: { display: "flex", justifyContent: "center", marginBottom: "40px" },
  input: {
    padding: "12px",
    fontSize: "1rem",
    marginRight: "10px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    width: "300px",
  },
  button: {
    padding: "12px 25px",
    fontSize: "1rem",
    cursor: "pointer",
    backgroundColor: "#0066b3",
    color: "white",
    border: "none",
    borderRadius: "6px",
  },
  grid: {
    display: "flex",
    flexWrap: "wrap",
    gap: "30px",
    justifyContent: "center",
  },
  card: {
    backgroundColor: "#f5faff",
    padding: "25px",
    borderRadius: "12px",
    boxShadow: "0px 4px 15px rgba(0,0,0,0.1)",
    textAlign: "left",
    width: "320px",
  },
  projectTitle: {
    marginBottom: "15px",
    color: "#003366",
  },
  progressBarContainer: {
    backgroundColor: "#e0e0e0",
    borderRadius: "10px",
    overflow: "hidden",
    height: "12px",
    marginBottom: "15px",
  },
  progressBarFill: {
    backgroundColor: "#0066b3",
    height: "100%",
  },
  viewButton: {
    marginTop: "10px",
    padding: "10px 20px",
    backgroundColor: "#003366",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
};

export default Projects;
