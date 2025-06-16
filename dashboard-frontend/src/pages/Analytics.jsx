import React, { useEffect, useState } from 'react';
import api from '../api';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

function Analytics() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await api.get("/projects/");
      setProjects(response.data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const allTasks = projects.flatMap(p => p.tasks);
  const totalTasks = allTasks.length;
  const pendingTasks = allTasks.filter(t => t.status !== "Completed").length;

  const statusCounts = {
    Pending: allTasks.filter(t => t.status === "Pending").length,
    "In Progress": allTasks.filter(t => t.status === "In Progress").length,
    Completed: allTasks.filter(t => t.status === "Completed").length,
    Blocked: allTasks.filter(t => t.status === "Blocked").length,
    Waiting: allTasks.filter(t => t.status === "Waiting for Approval").length
  };

  const roleCounts = {};
  allTasks.forEach(task => {
    roleCounts[task.role] = (roleCounts[task.role] || 0) + 1;
  });

  return (
    <div style={{ padding: '30px', background: '#f9f9f9' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px', color: '#0066b3' }}>Ambience Analytics Dashboard</h1>

      <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '40px' }}>
        <MetricCard title="Total Projects" value={projects.length} />
        <MetricCard title="Total Tasks" value={totalTasks} />
        <MetricCard title="Pending Tasks" value={pendingTasks} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-around' }}>
        <div style={{ width: '40%' }}>
          <h3 style={{ textAlign: 'center' }}>Tasks by Status</h3>
          <Pie
            data={{
              labels: Object.keys(statusCounts),
              datasets: [{
                data: Object.values(statusCounts),
                backgroundColor: ['#007bff', '#ffc107', '#28a745', '#dc3545', '#6c757d'],
              }],
            }}
          />
        </div>

        <div style={{ width: '50%' }}>
          <h3 style={{ textAlign: 'center' }}>Tasks by Role</h3>
          <Bar
            data={{
              labels: Object.keys(roleCounts),
              datasets: [{
                label: 'Tasks',
                data: Object.values(roleCounts),
                backgroundColor: '#0066b3',
              }],
            }}
          />
        </div>
      </div>

      <h3 style={{ marginTop: '50px', marginBottom: '20px' }}>Project Progress</h3>
      {projects.map(project => {
        const completed = project.tasks.filter(t => t.status === "Completed").length;
        const progress = totalTasks === 0 ? 0 : (completed / project.tasks.length) * 100;

        return (
          <div key={project.id} style={{ marginBottom: '20px' }}>
            <strong>{project.name}</strong>
            <div style={{ backgroundColor: '#ddd', borderRadius: '10px', overflow: 'hidden', height: '25px' }}>
              <div style={{
                width: `${progress}%`,
                backgroundColor: '#0066b3',
                height: '100%',
                color: 'white',
                textAlign: 'center',
                lineHeight: '25px'
              }}>
                {Math.round(progress)}%
              </div>
            </div>
          </div>
        )
      })}
    </div>
  );
}

function MetricCard({ title, value }) {
  return (
    <div style={{ background: '#fff', padding: '20px 40px', borderRadius: '10px', boxShadow: '0px 2px 10px rgba(0,0,0,0.1)', textAlign: 'center' }}>
      <h3 style={{ color: '#888' }}>{title}</h3>
      <h1 style={{ fontSize: '3rem', color: '#0066b3' }}>{value}</h1>
    </div>
  );
}

export default Analytics;
