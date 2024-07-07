import React, { useState } from 'react';
import axios from 'axios';
import './ConfigForm.css';

const ConfigForm = () => {
  const [repoUrl, setRepoUrl] = useState('');
  const [language, setLanguage] = useState('Node.js');
  const [languageVersion, setLanguageVersion] = useState('');
  const [customLanguageVersion, setCustomLanguageVersion] = useState('');
  const [useCustomVersion, setUseCustomVersion] = useState(false);
  const [buildCommand, setBuildCommand] = useState('');
  const [testCommand, setTestCommand] = useState('');
  const [installCommand, setInstallCommand] = useState('npm install');
  const [environment, setEnvironment] = useState('AWS');
  const [pushBranches, setPushBranches] = useState('main');
  const [pullRequestBranches, setPullRequestBranches] = useState('main');
  const [envVars, setEnvVars] = useState('');
  const [pipelineContent, setPipelineContent] = useState('');

  const handleBranchesChange = (setter) => (e) => {
    setter(e.target.value);
  };

  const handleEnvVarsChange = (e) => {
    setEnvVars(e.target.value);
  };

  const handleLanguageVersionChange = (e) => {
    const value = e.target.value;
    if (value === 'custom') {
      setUseCustomVersion(true);
      setLanguageVersion('');
    } else {
      setUseCustomVersion(false);
      setLanguageVersion(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8000/generate', {
        repo_url: repoUrl,
        language,
        language_version: useCustomVersion ? customLanguageVersion : languageVersion,
        build_command: buildCommand,
        test_command: testCommand,
        install_command: installCommand,
        environment,
        push_branches: pushBranches.split(',').map(branch => branch.trim()),
        pull_request_branches: pullRequestBranches.split(',').map(branch => branch.trim()),
        env_vars: envVars.split(',').map(envVar => envVar.trim())
      });
      setPipelineContent(response.data.pipeline_content);
    } catch (error) {
      console.error("Error generating pipeline", error);
    }
  };

  return (
    <div className="config-form-container">
      <form onSubmit={handleSubmit} className="config-form">
        <div className="form-group">
          <label>Repository URL:</label>
          <input type="text" value={repoUrl} onChange={(e) => setRepoUrl(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Language:</label>
          <select value={language} onChange={(e) => setLanguage(e.target.value)} required>
            <option value="Node.js">Node.js</option>
            <option value="Python">Python</option>
            <option value="Java">Java</option>
          </select>
        </div>
        <div className="form-group">
          <label>Language Version:</label>
          <select value={languageVersion} onChange={handleLanguageVersionChange} required={!useCustomVersion}>
            <option value="">Select version</option>
            <option value="22.4.0">v22.4.0 (2024-07-02)</option>
            <option value="21.7.3">v21.7.3 (2024-04-10)</option>
            <option value="20.15.0">v20.15.0 (2024-06-20)</option>
            <option value="18.20.3">v18.20.3 (2024-05-20)</option>
   
            <option value="custom">Custom</option>
          </select>
          {useCustomVersion && (
            <input
              type="text"
              value={customLanguageVersion}
              onChange={(e) => setCustomLanguageVersion(e.target.value)}
              placeholder="Enter custom version"
              required
            />
          )}
        </div>
        <div className="form-group">
          <label>Build Command:</label>
          <input type="text" value={buildCommand} onChange={(e) => setBuildCommand(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Test Command:</label>
          <input type="text" value={testCommand} onChange={(e) => setTestCommand(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Install Command:</label>
          <input type="text" value={installCommand} onChange={(e) => setInstallCommand(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Deployment Environment:</label>
          <select value={environment} onChange={(e) => setEnvironment(e.target.value)} required>
            <option value="AWS">AWS</option>
            <option value="Azure">Azure</option>
            <option value="GCP">GCP</option>
          </select>
        </div>
        <div className="form-group">
          <label>Push Branches (comma separated):</label>
          <input type="text" value={pushBranches} onChange={handleBranchesChange(setPushBranches)} />
        </div>
        <div className="form-group">
          <label>Pull Request Branches (comma separated):</label>
          <input type="text" value={pullRequestBranches} onChange={handleBranchesChange(setPullRequestBranches)} />
        </div>
        <div className="form-group">
          <label>Environment Variables (comma separated, key=value):</label>
          <input type="text" value={envVars} onChange={handleEnvVarsChange} />
        </div>
        <button type="submit" className="submit-button">Generate Pipeline</button>
      </form>
      <div className="code-display">
        <h3>Generated Pipeline Configuration:</h3>
        <pre>{pipelineContent}</pre>
      </div>
    </div>
  );
};

export default ConfigForm;
