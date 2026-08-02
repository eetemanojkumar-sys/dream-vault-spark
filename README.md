# 🚀 End-to-End DevOps CI/CD Pipeline for Dream Vault

## 📌 Project Overview

This project demonstrates a complete DevOps CI/CD pipeline for deploying a React application to Kubernetes using Jenkins, Docker, Helm, Prometheus, Grafana, and Slack notifications.

The pipeline automatically builds, tests, containerizes, pushes the Docker image to Docker Hub, deploys it to Kubernetes, and monitors the application using Prometheus and Grafana.

---

# 🏗 Architecture

```
Developer
    │
    ▼
GitHub Repository
    │
    ▼
GitHub Webhook
    │
    ▼
Jenkins CI/CD Pipeline
    │
    ├── Install Dependencies
    ├── Build React Application
    ├── Build Docker Image
    ├── Push Image to Docker Hub
    ├── Deploy to Kubernetes
    └── Slack Notification
                │
                ▼
         Kubernetes (Minikube)
                │
        ┌───────┴────────┐
        ▼                ▼
  Prometheus        Grafana
```

---

# 🛠 Tech Stack

- Git
- GitHub
- GitHub Webhooks
- Jenkins
- Docker
- Docker Hub
- Kubernetes (Minikube)
- Helm
- Prometheus
- Grafana
- Slack
- React
- Nginx

---

# ⚙ CI/CD Workflow

1. Developer pushes code to GitHub.
2. GitHub Webhook triggers Jenkins.
3. Jenkins installs dependencies.
4. Jenkins builds the React application.
5. Docker image is created.
6. Docker image is pushed to Docker Hub.
7. Kubernetes deployment is updated.
8. Pods are automatically rolled out.
9. Prometheus collects metrics.
10. Grafana visualizes metrics.
11. Slack receives deployment notifications.

---

# 📂 Project Structure

```
dream-vault/
│── Jenkinsfile
│── Dockerfile
│── deployment.yaml
│── service.yaml
│── package.json
│── README.md
│── src/
│── public/
```

---

# 📊 Monitoring

- Prometheus for metrics collection
- Grafana dashboards
- Kubernetes Node Monitoring
- Pod Monitoring
- CPU Monitoring
- Memory Monitoring

---

# 🚀 Deployment

```bash
git clone <repository-url>

docker build -t dream-vault .

kubectl apply -f deployment.yaml

kubectl apply -f service.yaml
```

---

# 📸 Screenshots

- Jenkins Pipeline
- Docker Hub Repository
- Kubernetes Pods
- Grafana Dashboard
- Prometheus Targets
- Slack Notifications

(Add screenshots here.)

---

# 👨‍💻 Author

**Manoj Kumar**

DevOps | AWS | Docker | Kubernetes | Jenkins | Terraform | Helm | Prometheus | Grafana

---

⭐ If you found this project useful, don't forget to star the repository.
