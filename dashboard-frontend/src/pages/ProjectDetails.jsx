import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';
import Navbar from '../components/Navbar';

function ProjectDetails() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return <div style={styles.loading}>Loading...</div>;
  }

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        <h1 style={styles.heading}>{project.name}</h1>

        <div style={styles.currentTaskBox}>
          <h3>Current Task:</h3>
          <p>{project.currentTask}</p>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
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
  loading: { textAlign: 'center', marginTop: '50px', fontSize: '1.5rem' }
};

export default ProjectDetails;
