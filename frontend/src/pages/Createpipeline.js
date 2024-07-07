import React, { useState } from 'react';
import axios from 'axios';

function Createpipeline() {
    const [name, setName] = useState('');
    const [repo, setRepo] = useState('');
    const [template, setTemplate] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        const pipelineData = { name, repo, template };
        axios.post('http://127.0.0.1:8000/create-pipeline', pipelineData)
            .then(response => {
                console.log('Pipeline created successfully!', response);
            })
            .catch(error => {
                console.error('There was an error creating the pipeline!', error);
            });
    };

    return (
        <div>
            <h1>Create Pipeline</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Name:</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div>
                    <label>Repository URL:</label>
                    <input type="text" value={repo} onChange={(e) => setRepo(e.target.value)} />
                </div>
                <div>
                    <label>Template:</label>
                    <input type="text" value={template} onChange={(e) => setTemplate(e.target.value)} />
                </div>
                <button type="submit">Create</button>
            </form>
        </div>
    );
}

export default Createpipeline;
