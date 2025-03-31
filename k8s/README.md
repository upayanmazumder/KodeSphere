# Kubernetes Deployment

## Project Overview

This project is a FastAPI application that provides an endpoint for deploying applications to a Kubernetes cluster. It generates Kubernetes manifests for deployments, services, and ingress resources based on the provided input.

## Project Structure

```
k8s
├── Dockerfile
├── docker-compose.yml
├── server.py
└── README.md
```

## Getting Started

### Prerequisites

- Docker
- Docker Compose
- Kubernetes cluster (e.g., Minikube, GKE, EKS, AKS)
- `kubectl` command-line tool configured to interact with your Kubernetes cluster

### Building the Docker Image

To build the Docker image for the FastAPI application, run the following command in the project directory:

```
docker build -t fastapi-k8s-app .
```

### Running the Application with Docker Compose

To run the application using Docker Compose, execute the following command:

```
docker-compose up
```

This command will build the image (if not already built) and start the FastAPI application.

### API Endpoint

The FastAPI application exposes a POST endpoint at `/deploy`. You can send a JSON payload to this endpoint with the following fields:

- `image`: The Docker image to deploy.
- `url`: The URL for the application (used to derive the app name).
- `ports`: A list of ports to expose (optional, defaults to `[80]`).

### Example Request

Here is an example of how to make a request to the `/deploy` endpoint using `curl`:

```bash
curl -X POST "http://localhost:8000/deploy" -H "Content-Type: application/json" -d '{
  "image": "your-docker-image",
  "url": "your-app-url.com",
  "ports": [80, 443]
}'
```

### Stopping the Application

To stop the application, you can use `CTRL+C` in the terminal where Docker Compose is running. Alternatively, you can run:

```
docker-compose down
```

## License

This project is licensed under the MIT License. See the LICENSE file for more details.
