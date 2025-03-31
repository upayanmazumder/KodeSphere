from fastapi import FastAPI, HTTPException
import subprocess

app = FastAPI()

def generate_deployment_yaml(app_name: str, image: str, ports: list) -> str:
    """Generates Kubernetes Deployment YAML."""
    return f"""
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {app_name}-deployment
  namespace: default
spec:
  replicas: 1
  selector:
    matchLabels:
      app: {app_name}
  template:
    metadata:
      labels:
        app: {app_name}
    spec:
      containers:
      - name: {app_name}-container
        image: {image}
        ports:
""" + "".join(f"""
        - containerPort: {port}
""" for port in ports)


def generate_service_yaml(app_name: str, ports: list) -> str:
    """Generates Kubernetes Service YAML."""
    return f"""
apiVersion: v1
kind: Service
metadata:
  name: {app_name}-service
  namespace: default
spec:
  selector:
    app: {app_name}
  ports:
""" + "".join(f"""
  - protocol: TCP
    port: {port}
    targetPort: {port}
""" for port in ports)


def generate_ingress_yaml(app_name: str, url: str, ports: list) -> str:
    """Generates Kubernetes Ingress YAML."""
    return f"""
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: {app_name}-ingress
  namespace: default
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt
spec:
  ingressClassName: nginx
  rules:
  - host: {url}
    http:
      paths:
""" + "".join(f"""
      - path: /
        pathType: Prefix
        backend:
          service:
            name: {app_name}-service
            port:
              number: {port}
""" for port in ports) + f"""
  tls:
  - hosts:
    - {url}
    secretName: {app_name}-tls
"""


def apply_k8s_manifests(deployment_yaml: str, service_yaml: str, ingress_yaml: str) -> None:
    """Applies Kubernetes manifests using kubectl."""
    try:
        subprocess.run("kubectl apply -f -", input=deployment_yaml, shell=True, text=True, check=True)
        subprocess.run("kubectl apply -f -", input=service_yaml, shell=True, text=True, check=True)
        subprocess.run("kubectl apply -f -", input=ingress_yaml, shell=True, text=True, check=True)
    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=500, detail=f"Error applying Kubernetes manifests: {str(e)}")


@app.post("/deploy")
async def deploy_app(payload: dict):
    image = payload.get("image")
    domains = payload.get("domains")  # List of domains, each with its own ports

    if not image or not domains:
        raise HTTPException(status_code=400, detail="Missing required fields")

    for domain in domains:
        url = domain.get("url")
        ports = domain.get("ports", [80])  # Default to port 80

        if not url or not ports:
            raise HTTPException(status_code=400, detail="Each domain must have a URL and ports")

        app_name = url.split(".")[0]  # Extract subdomain

        # Generate Kubernetes YAMLs
        deployment_yaml = generate_deployment_yaml(app_name, image, ports)
        service_yaml = generate_service_yaml(app_name, ports)
        ingress_yaml = generate_ingress_yaml(app_name, url, ports)

        # Apply Kubernetes manifests
        apply_k8s_manifests(deployment_yaml, service_yaml, ingress_yaml)

    return {"message": "Deployment successful for all domains"}
