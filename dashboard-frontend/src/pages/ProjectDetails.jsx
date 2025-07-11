import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';
import Navbar from '../components/Navbar';

function ProjectDetails() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalTask, setModalTask] = useState(null);

  useEffect(() => {
    fetchProject();
  }, []);

  const fetchProject = async () => {
    try {
      const response = await api.get(`/projects/${id}`);
      const tasks = response.data.tasks;

      const pendingTasks = tasks.filter(task => task.status !== "Completed");
      const currentTask = pendingTasks.length > 0 ? pendingTasks[0].name : "All tasks completed!";

      setProject({
        id: response.data.id,
        name: response.data.name,
        drawingNumber: response.data.drawing_number,
        drawingVersion: response.data.drawing_version,
        tasks: tasks,
        currentTask: currentTask
      });
      setLoading(false);
    } catch (error) {
      console.error("Error fetching project:", error);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.patch(`/tasks/${taskId}/status?status=${newStatus}`);
      fetchProject();  // Refresh project after update
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };

  const handleDrawingVersionUpdate = async () => {
    try {
      await api.patch(`/projects/${project.id}/drawing-version?version=${project.drawingVersion}`);
      alert("Drawing version updated. Please inform the draftsman that this has been changed.");
      fetchProject(); // refresh project
    } catch (err) {
      console.error("Failed to update drawing version", err);
    }
  };

  const openModal = (task) => setModalTask(task);
  const closeModal = () => setModalTask(null);

  if (loading) {
    return <div style={styles.loading}>Loading...</div>;
  }

  return (
    <>
      {/* <Navbar /> */}
      <div style={styles.container}>
        <h1 style={styles.heading}>{project.name}</h1>

        <div style={styles.currentTaskBox}>
          <h3>Current Task:</h3>
          <p>{project.currentTask}</p>
        </div>

        <div style={{ ...styles.currentTaskBox, marginTop: "20px" }}>
          <h3>Drawing Info</h3>
          <p><strong>Drawing Number:</strong> {project.drawingNumber || "N/A"}</p>
          <div style={{ display: "flex", gap: "10px", alignItems: "center", marginTop: "10px" }}>
            <input
              type="text"
              placeholder="Enter Drawing Version"
              value={project.drawingVersion || ""}
              onChange={(e) =>
                setProject((prev) => ({ ...prev, drawingVersion: e.target.value }))
              }
              style={styles.input}
            />
            <button
              onClick={handleDrawingVersionUpdate}
              style={styles.saveButton}
            >
              Update Version
            </button>
          </div>
        </div>

        <div style={styles.taskListContainer}>
          <h3 style={styles.subHeading}>All Tasks</h3>
          <table style={styles.table}>
            <thead>
              <tr>
                <th>Task Name</th>
                <th>Role</th>
                <th>Status</th>
                <th>Update</th>
                <th>Info</th>
              </tr>
            </thead>
            <tbody>
              {project.tasks.map((task) => (
                <tr key={task.id}>
                  <td>{task.name}</td>
                  <td>{task.role}</td>
                  <td style={styles.status(task.status)}>{task.status}</td>
                  <td>
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusChange(task.id, e.target.value)}
                      style={styles.select}
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Waiting for Approval">Waiting for Approval</option>
                      <option value="Completed">Completed</option>
                      <option value="Blocked">Blocked</option>
                    </select>
                  </td>
                  <td>
                    <button onClick={() => openModal(task)} style={styles.infoButton}>ℹ️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modalTask && (
        <div style={styles.modalOverlay} onClick={closeModal}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <span style={styles.closeButton} onClick={closeModal}>&times;</span>
            <h3>Task Info</h3>
            <p><strong>Who:</strong> {modalTask.who || "N/A"}</p>
            <p><strong>What:</strong> {modalTask.what || "N/A"}</p>
            <p><strong>When:</strong> {modalTask.when || "N/A"}</p>
            <p><strong>How:</strong> {modalTask.how || "N/A"}</p>
          </div>
        </div>
      )}
    </>
  );
}

const styles = {
  container: { maxWidth: '1000px', margin: '0 auto', padding: '40px 20px' },
  heading: { color: '#0A2647', fontSize: '2.5rem', marginBottom: '30px' },
  subHeading: { marginBottom: '20px', color: '#0A2647' },
  currentTaskBox: { backgroundColor: '#F1F6F9', padding: '20px', borderRadius: '10px', marginBottom: '40px' },
  taskListContainer: { backgroundColor: '#F9FAFB', padding: '20px', borderRadius: '10px' },
  table: { width: '100%', borderCollapse: 'collapse' },
  status: (status) => ({
    color: status === 'Completed' ? 'green' : (status === 'Pending' ? '#FFA500' : '#333'),
    fontWeight: 'bold'
  }),
  select: { padding: '8px', borderRadius: '5px', border: '1px solid #ccc' },
  infoButton: { background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.2rem' },
  loading: { textAlign: 'center', marginTop: '50px', fontSize: '1.5rem' },
  modalOverlay: {
    position: 'fixed',
    top: 0, left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999
  },
  modal: {
    background: '#fff',
    padding: '30px',
    borderRadius: '10px',
    width: '90%',
    maxWidth: '400px',
    position: 'relative'
  },
  closeButton: {
    position: 'absolute',
    top: '10px',
    right: '15px',
    fontSize: '1.5rem',
    cursor: 'pointer'
  },
  input: {
    padding: '8px',
    border: '1px solid #ccc',
    borderRadius: '5px',
    flex: 1
  },
  saveButton: {
    padding: '8px 16px',
    backgroundColor: '#0066b3',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer'
  }
};

export default ProjectDetails;
