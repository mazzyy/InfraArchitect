from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from huggingface_hub import InferenceApi

router = APIRouter()

class UserInput(BaseModel):
    user_input: str

class PipelineConfig(BaseModel):
    repo_url: str
    language: str
    language_version: Optional[str] = None
    build_command: str
    test_command: Optional[str] = None
    install_command: str
    environment: str
    deploy_option: bool
    use_docker: bool
    docker_username: Optional[str] = None
    docker_password: Optional[str] = None
    push_branches: List[str]
    pull_request_branches: List[str]
    env_vars: Optional[List[str]] = None
    monitoring: bool = False
    security_scanning: bool = False
    canary_deployment: bool = False
    blue_green_deployment: bool = False
    cache_dependencies: bool = False
    linting: bool = False
    code_coverage: bool = False
    static_analysis: bool = False
    notifications: bool = False
    conditional_steps: bool = False
    integration_tests: bool = False
    deploy_staging: bool = False
    deploy_production: bool = False
    ec2_instance_id: Optional[str] = None
    ec2_key_name: Optional[str] = None
    ec2_security_group: Optional[str] = None
    gcp_instance_id: Optional[str] = None
    gcp_key_file: Optional[str] = None
    azure_instance_id: Optional[str] = None
    azure_credentials: Optional[str] = None

# Replace 'your-hugging-face-api-token' with your actual Hugging Face API token
huggingface_api = InferenceApi(repo_id="bigscience/bloom", token="your-hugging-face-api-token")

@router.post("/api/generate")
async def generate_pipeline(user_input: UserInput):
    try:
        # Get user input processed by Hugging Face model
        response = huggingface_api(user_input.user_input)
        # Process the response to create a PipelineConfig object
        # For simplicity, let's assume the response contains necessary info to create PipelineConfig
        config_data = response  # This would be your processed data
        config = PipelineConfig(**config_data)
        pipeline_content = create_pipeline(config)
        return {"pipeline_content": pipeline_content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def create_pipeline(config: PipelineConfig):
    # Generate pipeline content based on the config
    pipeline = f"""
name: CI

on:
  push:
    branches:
{format_branches(config.push_branches)}
  pull_request:
    branches:
{format_branches(config.pull_request_branches)}

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout code
      uses: actions/checkout@v2

    - name: Set up {config.language}
      uses: actions/setup-{config.language.lower()}@v2
      with:
        {config.language.lower()}-version: '{config.language_version}'

    - name: Set environment variables
      run: |
        {format_env_vars(config.env_vars)}

    - name: Install dependencies
      run: {config.install_command}

    - name: Build project
      run: {config.build_command}
"""
    if config.test_command:
        pipeline += f"""
    - name: Run tests
      run: {config.test_command}
"""
    if config.use_docker:
        pipeline += f"""
  docker_build_and_push:
    runs-on: ubuntu-latest
    needs: build
    steps:
    - name: Log in to Docker Hub
      run: echo {config.docker_password} | docker login -u {config.docker_username} --password-stdin

    - name: Build Docker image
      run: docker build -t {config.docker_username}/my-app:${{{{ github.sha }}}} .

    - name: Push Docker image to Docker Hub
      run: docker push {config.docker_username}/my-app:${{{{ github.sha }}}}

    - name: Create docker-compose.yml
      run: |
        echo 'version: "3"' > docker-compose.yml
        echo 'services:' >> docker-compose.yml
        echo '  app:' >> docker-compose.yml
        echo '    image: {config.docker_username}/my-app:${{{{ github.sha }}}}' >> docker-compose.yml
        echo '    ports:' >> docker-compose.yml
        echo '      - "80:80"' >> docker-compose.yml
        echo '    environment:' >> docker-compose.yml
        echo '      - NODE_ENV=production' >> docker-compose.yml
"""
    if config.deploy_option:
        if config.environment == 'AWS':
            pipeline += f"""
  deploy_to_ec2:
    runs-on: ubuntu-latest
    needs: {'docker_build_and_push' if config.use_docker else 'build'}
    steps:
    - name: Deploy to EC2
      run: |
        aws ec2 describe-instances --instance-ids {config.ec2_instance_id} --query "Reservations[0].Instances[0].PublicIpAddress"
        scp -i {config.ec2_key_name}.pem docker-compose.yml ubuntu@${{{{ secrets.EC2_PUBLIC_IP }}}}:~/docker-compose.yml
        ssh -i {config.ec2_key_name}.pem ubuntu@${{{{ secrets.EC2_PUBLIC_IP }}}} docker-compose up -d
"""
    return pipeline

def format_branches(branches):
    return '\n'.join([f'      - {branch}' for branch in branches])

def format_env_vars(env_vars):
    return '\n'.join([f'export {env_var}' for env_var in env_vars])
