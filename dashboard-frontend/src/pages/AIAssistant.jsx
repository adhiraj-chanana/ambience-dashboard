import React, { useState, useEffect } from 'react';
import api from '../api';

function AIAssistant() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [prompt, setPrompt] = useState("");
  const [aiResponse, setAIResponse] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await api.get("/projects");
      setProjects(res.data);
    } catch (err) {
      console.error("Failed to fetch projects:", err);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedProject || !prompt) return;
    setLoading(true);
    setAIResponse("");

    try {
      const aiRes = await api.post("/ai/analyze", {
        projectName: selectedProject,
        prompt: prompt
      });
      setAIResponse(aiRes.data.analysis);
    } catch (err) {
      console.error("AI analysis failed:", err);
      setAIResponse("Error generating AI report");
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>Ambience AI Assistant</h1>

      <div style={{ marginBottom: 20 }}>
        <select
          value={selectedProject}
          onChange={e => setSelectedProject(e.target.value)}
          style={{ padding: 10, width: 420 }}
        >
          <option value="">Select a project...</option>
          {projects.map((proj) => (
            <option key={proj.id} value={proj.name}>
              {proj.name}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: 20 }}>
        <textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder="Ask AI anything about this project..."
          style={{ padding: 10, width: 400, height: 100 }}
        />
      </div>

      <button onClick={handleAnalyze} style={{ padding: '10px 20px' }}>
        Analyze
      </button>

      {loading && <p>Loading AI...</p>}

      {aiResponse && (
        <div style={{ background: "#f2f2f2", padding: 20, borderRadius: 10, marginTop: 20 }}>
          <pre>{aiResponse}</pre>
        </div>
      )}
    </div>
  );
}

export default AIAssistant;
