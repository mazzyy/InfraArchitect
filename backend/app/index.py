from fastapi import APIRouter
from pydantic import BaseModel
from typing import List

router = APIRouter()

class PipelineConfig(BaseModel):
    repo_url: str
    language: str
    language_version: str = None
    build_command: str
    test_command: str = None
    install_command: str
    environment: str
    push_branches: List[str]
    pull_request_branches: List[str]
    env_vars: List[str] = None

@router.post("/generate")
def generate_pipeline(config: PipelineConfig):
    pipeline_content = create_pipeline(config)
    return {"pipeline_content": pipeline_content}

def create_pipeline(config: PipelineConfig):
    push_branches = "\n".join([f"      - {branch}" for branch in config.push_branches])
    pull_request_branches = "\n".join([f"      - {branch}" for branch in config.pull_request_branches])
    env_vars = "\n".join([f"    {var}" for var in config.env_vars]) if config.env_vars else ""
    
    if config.language == "Node.js":
        language_setup = f"""
    - name: Set up Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '{config.language_version}'
""" if config.language_version else ""

        return f"""
name: CI

on:
  push:
    branches:
{push_branches}
  pull_request:
    branches:
{pull_request_branches}

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout code
      uses: actions/checkout@v2
{language_setup}
    - name: Set environment variables
      run: |
{env_vars}
    - name: Install dependencies
      run: {config.install_command}

    - name: Build project
      run: {config.build_command}

    - name: Run tests
      run: {config.test_command}
"""
    # Add more logic for different languages and CI/CD tools
