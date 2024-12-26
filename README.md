# CI/CD Pipeline for Node.js Application with Docker, Kubernetes, and Slack Notifications

This repository demonstrates how to set up a CI/CD pipeline for a **Node.js** application. The pipeline runs automatically on pull requests, builds a Docker image, deploys the image to a **Kubernetes** cluster, and sends notifications to a **Slack** channel about the deployment status.

## Features

- **Automated Tests**: Runs tests on every pull request to ensure the code quality.
- **Docker Integration**: Builds a Docker image of the Node.js app.
- **Kubernetes Deployment**: Deploys the Docker image to a Kubernetes cluster.
- **Slack Notifications**: Sends notifications to a Slack channel upon deployment success or failure.

## Prerequisites

To set up this CI/CD pipeline, you’ll need:

- **GitHub Account**: To store your code and set up GitHub Actions.
- **Docker Desktop**: If you are using a local Kubernetes cluster for deployment (e.g., Minikube or Docker Desktop).
- **Kubernetes Cluster**: A running Kubernetes cluster for deploying the Docker image.
- **Slack Workspace**: For setting up Slack notifications.
- **Slack App**: To send deployment notifications to Slack.

### Tools Used:
- GitHub Actions
- Docker
- Kubernetes
- Slack

## Project Setup

### Step 1: Clone the Repository

Clone this repository to your local machine.

```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
```

### Step 2: Setup the Node.js Application

1. **Install dependencies**:

   Navigate to your project directory and install Node.js dependencies.

   ```bash
   npm install
   ```

2. **Run Tests**:

   To ensure the application works, you can run the tests locally:

   ```bash
   npm test
   ```

### Step 3: Dockerize the Application

This project includes a `Dockerfile` for containerizing the Node.js application. Here's the basic Dockerfile:

```dockerfile
# Use official Node.js image
FROM node:18

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the application code
COPY . .

# Expose port 3000
EXPOSE 3000

# Command to run the application
CMD ["node", "index.js"]
```

To build and run the Docker container locally:

```bash
docker build -t my-node-app .
docker run -p 3000:3000 my-node-app
```

### Step 4: Kubernetes Setup

Make sure you have **kubectl** and **Docker** configured to work with your Kubernetes cluster.

1. **Kubeconfig**: If you're using **Docker Desktop** with Kubernetes enabled, you don't need to do much. Just ensure you have a valid kubeconfig in your local environment (`~/.kube/config`).
   
2. **Deployment Configuration**: The `k8s/deployment.yaml` file is used for deploying the Docker image to Kubernetes.

Here is a sample `k8s/deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: node-app
spec:
  replicas: 2
  selector:
    matchLabels:
      app: node-app
  template:
    metadata:
      labels:
        app: node-app
    spec:
      containers:
      - name: node-app
        image: my-node-app:latest
        ports:
        - containerPort: 3000
---
apiVersion: v1
kind: Service
metadata:
  name: node-app-service
spec:
  selector:
    app: node-app
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3000
  type: LoadBalancer
```

Apply the Kubernetes resources:

```bash
kubectl apply -f k8s/deployment.yaml
```

### Step 5: GitHub Actions CI/CD Pipeline

This project uses **GitHub Actions** for CI/CD automation. The workflow is defined in the `.github/workflows/ci-cd-pipeline.yml` file. It includes the following steps:

1. **Trigger**: Runs on `push` or `pull_request` events for the `main` branch.
2. **Run Tests**: Executes the tests defined in `npm test`.
3. **Build Docker Image**: Builds a Docker image for the Node.js app.
4. **Push Docker Image**: Pushes the Docker image to Docker Hub (configured via GitHub Secrets).
5. **Deploy to Kubernetes**: Uses `kubectl` to deploy the Docker image to the Kubernetes cluster.
6. **Slack Notifications**: Sends a message to Slack when the deployment succeeds or fails.

Here is a sample GitHub Actions workflow (`.github/workflows/ci-cd-pipeline.yml`):

```yaml
name: CI/CD Pipeline with Slack Notifications

on:
  pull_request:
    branches:
      - main  # Trigger the workflow on pull requests to the main branch

jobs:
  build_and_deploy:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout code
      uses: actions/checkout@v2

    - name: Set up Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '14'

    - name: Install dependencies
      run: npm install

    - name: Run tests
      run: npm test

    - name: Log in to Docker Hub
      uses: docker/login-action@v2
      with:
        username: ${{ secrets.DOCKER_USERNAME }}
        password: ${{ secrets.DOCKER_PASSWORD }}

    - name: Build Docker image
      run: docker build -t ${{ secrets.DOCKER_USERNAME }}/my-node-app:$GITHUB_SHA .

    - name: Push Docker image
      run: docker push ${{ secrets.DOCKER_USERNAME }}/my-node-app:$GITHUB_SHA

    - name: Set up Kubernetes kubeconfig
      run: |
        echo "${{ secrets.KUBECONFIG }}" | base64 --decode > ~/.kube/config

    - name: Deploy to Kubernetes
      run: |
        kubectl set image deployment/node-app node-app=${{ secrets.DOCKER_USERNAME }}/my-node-app:$GITHUB_SHA
        kubectl rollout status deployment/node-app

    # Send success notification to Slack
    - name: Send success notification to Slack
      if: success()
      run: |
        curl -X POST -H 'Content-type: application/json' --data '{"text":"Deployment successful! The app is now live."}' ${{ secrets.SLACK_WEBHOOK_URL }}

    # Send failure notification to Slack
    - name: Send failure notification to Slack
      if: failure()
      run: |
        curl -X POST -H 'Content-type: application/json' --data '{"text":"Deployment failed! Something went wrong."}' ${{ secrets.SLACK_WEBHOOK_URL }}
```

### Step 6: Configure GitHub Secrets

To securely store sensitive data like Docker Hub credentials and the Slack Webhook URL, configure the following **GitHub secrets**:

1. `DOCKER_USERNAME` - Your Docker Hub username.
2. `DOCKER_PASSWORD` - Your Docker Hub password (or a generated token).
3. `KUBECONFIG` - Your base64-encoded Kubernetes kubeconfig file.
4. `SLACK_WEBHOOK_URL` - The Webhook URL generated from your Slack App.

To add secrets to GitHub:

1. Navigate to **Settings** > **Secrets and variables** > **Actions** in your GitHub repository.
2. Click **New repository secret**.
3. Add the secret key-value pairs as mentioned above.

### Step 7: Monitor the Pipeline

1. Once you push your changes, or create a pull request, GitHub Actions will automatically trigger the pipeline.
2. Go to the **Actions** tab in your GitHub repository to monitor the workflow’s progress.
3. Slack notifications will inform you about the status of the deployment.

## Troubleshooting

- **Docker Image Push Failures**: Ensure your `DOCKER_USERNAME` and `DOCKER_PASSWORD` secrets are correctly configured.
- **Kubernetes Deployment Issues**: Verify your kubeconfig file and make sure `kubectl` is properly set up in the workflow.
- **Slack Webhook Errors**: Double-check your Slack Webhook URL and ensure it's configured as a secret in your repository.

## Conclusion

This project demonstrates a complete CI/CD pipeline for a Node.js application with Docker, Kubernetes, and Slack notifications. By automating testing, Docker image building, deployment, and notifications, you can streamline your deployment process and ensure quick feedback for your team.