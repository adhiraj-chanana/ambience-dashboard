import React, { useState, useEffect } from 'react';
import api from '../api';

function AIAssistant() {
  const [query, setQuery] = useState("");
  const [aiResponse, setAIResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!query) return;
    setLoading(true);
    setAIResponse("");

    try {
      const aiRes = await api.post("/ai/analyze", { query });
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
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Ask AI about any project..."
          style={{ padding: 10, width: 400 }}
        />
        <button onClick={handleAnalyze} style={{ marginLeft: 10, padding: '10px 20px' }}>
          Analyze
        </button>
      </div>

      {loading && <p>Loading AI...</p>}

      {aiResponse && (
        <div style={{ background: "#f2f2f2", padding: 20, borderRadius: 10 }}>
          <pre>{aiResponse}</pre>
        </div>
      )}
    </div>
  );
}

export default AIAssistant;
