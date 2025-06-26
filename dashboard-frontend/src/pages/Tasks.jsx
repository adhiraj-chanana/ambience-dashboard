import React, { useEffect, useState } from "react";
import api from "../api";

function MyTasks() {
  const [projectTasks, setProjectTasks] = useState([]);
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    fetchMyTasks();
  }, []);

  const fetchMyTasks = async () => {
    try {
      const res = await api.get("/my-tasks");
      setProjectTasks(res.data);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  };

  const toggleExpand = (projectId) => {
    setExpanded((prev) => ({
      ...prev,
      [projectId]: !prev[projectId],
    }));
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>My Tasks</h1>
      {projectTasks.length === 0 ? (
        <p style={styles.noTasks}>No tasks assigned.</p>
      ) : (
        projectTasks.map((project) => {
          // Find current task (first not Completed)
          const currentTask = project.tasks.find((t) => t.status !== "Completed");

          // Filter: show only tasks that are In Progress or current
          const filteredTasks = project.tasks.filter((task) =>
            task.status === "In Progress" || task.id === (currentTask?.id ?? -1)
          );

          // Skip this project if no relevant tasks
          if (filteredTasks.length === 0) return null;

          const pendingCount = project.tasks.filter((t) => t.status !== "Completed").length;

          return (
            <div key={project.project_id} style={styles.projectCard}>
              <div
                style={styles.projectHeader}
                onClick={() => toggleExpand(project.project_id)}
              >
                <h2 style={styles.projectTitle}>{project.project_name}</h2>
                <p style={styles.taskCount}>
                  {pendingCount} / {project.tasks.length} Pending
                </p>
              </div>

              {expanded[project.project_id] && (
                <div style={styles.taskList}>
                  {filteredTasks.map((task) => (
                    <div key={task.id} style={styles.taskCard}>
                      <h3>{task.name}</h3>
                      <p><strong>Status:</strong> {task.status}</p>
                      <p><strong>What:</strong> {task.what}</p>
                      <p><strong>When:</strong> {task.when}</p>
                      <p><strong>How:</strong> {task.how}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

const styles = {
  container: { maxWidth: "1000px", margin: "0 auto", padding: "40px 20px" },
  heading: { fontSize: "2rem", marginBottom: "30px", color: "#004080" },
  noTasks: { fontStyle: "italic", color: "#888" },
  projectCard: {
    backgroundColor: "#eaf4ff",
    marginBottom: "25px",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0px 3px 12px rgba(0,0,0,0.08)",
    cursor: "pointer",
  },
  projectHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  projectTitle: {
    fontSize: "1.4rem",
    color: "#003366",
  },
  taskCount: {
    fontSize: "1rem",
    color: "#005599",
    fontWeight: "bold",
  },
  taskList: {
    marginTop: "15px",
  },
  taskCard: {
    backgroundColor: "#ffffff",
    padding: "15px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    marginBottom: "10px",
  },
};

export default MyTasks;
