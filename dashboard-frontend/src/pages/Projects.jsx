import React, { useState, useEffect } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

function Projects() {
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [users, setUsers] = useState([]);

  const predefinedRoles = [
    "Project Coordinator",
    "Project Engineer",
    "Supervisor",
    "Measurement Engineer",
    "Operation Head",
    "Purchase Coordinator",
    "Director",
    "Store Coordinator"
  ];

  const [newProject, setNewProject] = useState({
    name: "",
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    address: "",
    roles: predefinedRoles.map((role) => ({ role, userId: "" })),
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
    fetchUsers();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await api.get("/projects/");
      setProjects(res.data);
    } catch (err) {
      console.error("Error fetching projects:", err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get("/users");
      setUsers(res.data);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const handleRoleChange = (index, field, value) => {
    const updatedRoles = [...newProject.roles];
    updatedRoles[index][field] = value;
    setNewProject((prev) => ({ ...prev, roles: updatedRoles }));
  };

  const handleCreateProject = async () => {
    try {
      await api.post("/projects/full-create", newProject);
      setShowModal(false);
      setNewProject({
        name: "",
        clientName: "",
        clientEmail: "",
        clientPhone: "",
        address: "",
        roles: predefinedRoles.map((role) => ({ role, userId: "" })),
      });
      fetchProjects();
    } catch (err) {
      console.error("Error creating project:", err);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Projects</h1>

      <div style={styles.form}>
        <button style={styles.button} onClick={() => setShowModal(true)}>
          + Add Project
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

      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h2>Add New Project</h2>

            <input
              style={styles.modalInput}
              placeholder="Project Name"
              value={newProject.name}
              onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
            />
            <input
              style={styles.modalInput}
              placeholder="Client Name"
              value={newProject.clientName}
              onChange={(e) => setNewProject({ ...newProject, clientName: e.target.value })}
            />
            <input
              style={styles.modalInput}
              placeholder="Client Email"
              value={newProject.clientEmail}
              onChange={(e) => setNewProject({ ...newProject, clientEmail: e.target.value })}
            />
            <input
              style={styles.modalInput}
              placeholder="Client Phone"
              value={newProject.clientPhone}
              onChange={(e) => setNewProject({ ...newProject, clientPhone: e.target.value })}
            />
            <input
              style={styles.modalInput}
              placeholder="Project Address"
              value={newProject.address}
              onChange={(e) => setNewProject({ ...newProject, address: e.target.value })}
            />

            <h4>Assign Users to Roles</h4>
            {newProject.roles.map((r, i) => (
              <div key={i} style={{ marginBottom: "10px", display: "flex", justifyContent: "space-between" }}>
                <input
                  value={r.role}
                  readOnly
                  style={{ ...styles.modalInputSmall, backgroundColor: "#f0f0f0", cursor: "not-allowed" }}
                />
                <select
                  value={r.userId}
                  onChange={(e) => handleRoleChange(i, "userId", e.target.value)}
                  style={styles.modalInputSmall}
                >
                  <option value="">Assign User</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.username}
                    </option>
                  ))}
                </select>
              </div>
            ))}

            <div style={{ marginTop: "20px" }}>
              <button onClick={handleCreateProject} style={styles.primaryButton}>Create</button>
              <button onClick={() => setShowModal(false)} style={styles.secondaryButton}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { maxWidth: "1200px", margin: "0 auto", padding: "40px 20px" },
  heading: { fontSize: "2.2rem", marginBottom: "30px", color: "#004080" },
  form: { display: "flex", justifyContent: "center", marginBottom: "40px" },
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
  modalOverlay: {
    position: "fixed",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    display: "flex", justifyContent: "center", alignItems: "center",
    zIndex: 999,
  },
  modal: {
    backgroundColor: "white",
    padding: "30px",
    borderRadius: "10px",
    width: "500px",
    maxHeight: "90vh",
    overflowY: "auto",
  },
  modalInput: {
    width: "100%",
    padding: "10px",
    marginBottom: "10px",
    border: "1px solid #ccc",
    borderRadius: "6px",
  },
  modalInputSmall: {
    width: "48%",
    padding: "10px",
    marginRight: "4%",
    marginBottom: "10px",
    border: "1px solid #ccc",
    borderRadius: "6px",
  },
  primaryButton: {
    padding: "10px 20px",
    marginRight: "10px",
    backgroundColor: "#0066b3",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  secondaryButton: {
    padding: "10px 20px",
    backgroundColor: "#ccc",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    marginRight: "10px",
  },
};

export default Projects;
