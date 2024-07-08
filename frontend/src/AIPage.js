import React, { useState } from 'react';
import axios from 'axios';
import "./AIPage.css"

const AIPage = () => {
  const [userInput, setUserInput] = useState('');
  const [pipelineContent, setPipelineContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await axios.post('http://localhost:8000/api/generate', { user_input: userInput });
      setPipelineContent(response.data.pipeline_content);
    } catch (error) {
      setError('Error generating pipeline. Please try again.');
      console.error("Error generating pipeline", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="aipage">
      <h1>Generate CI/CD Pipeline with AI</h1>
      <form onSubmit={handleSubmit}>
        <textarea
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Describe your CI/CD requirements..."
          rows="5"
        />
        <button type="submit" disabled={loading}>Generate Pipeline</button>
      </form>
      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}
      {pipelineContent && (
        <div className="pipeline-content">
          <h2>Generated Pipeline:</h2>
          <pre>{pipelineContent}</pre>
        </div>
      )}
    </div>
  );
};

export default AIPage;
