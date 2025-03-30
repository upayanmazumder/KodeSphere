from fastapi import FastAPI, HTTPException
import subprocess
import os
from dotenv import load_dotenv

# Load environment variables from a .env file
load_dotenv()

app = FastAPI()

@app.post("/deploy")
async def deploy_app(payload: dict):
    image = payload.get("image") or os.getenv("DEFAULT_IMAGE")  # Fallback to env variable if not provided
    domains = payload.get("domains")  # List of domains, each with its own ports

    if not image or not domains:
        raise HTTPException(status_code=400, detail="Missing required fields")

    for domain in domains:
        url = domain.get("url")
        ports = domain.get("ports", [80])  # Default to port 80

        if not url or not ports:
            raise HTTPException(status_code=400, detail="Each domain must have a URL and ports")

        app_name = url.split(".")[0]  # Extract subdomain

        # Create Deployment YAML
        deployment_yaml = f"""
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {app_name}-deployment
  namespace: {os.getenv("K8S_NAMESPACE", "default")}
spec:
  replicas: {os.getenv("DEPLOYMENT_REPLICAS", "1")}
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

        # Create Service YAML
        service_yaml = f"""
apiVersion: v1
kind: Service
metadata:
  name: {app_name}-service
  namespace: {os.getenv("K8S_NAMESPACE", "default")}
spec:
  selector:
    app: {app_name}
  ports:
""" + "".join(f"""
  - protocol: TCP
    port: {port}
    targetPort: {port}
""" for port in ports)

        # Create Ingress YAML
        ingress_yaml = f"""
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: {app_name}-ingress
  namespace: {os.getenv("K8S_NAMESPACE", "default")}
  annotations:
    cert-manager.io/cluster-issuer: {os.getenv("CERT_MANAGER_ISSUER", "letsencrypt")}
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

        # Apply Kubernetes manifests for each domain and its configuration
        try:
            subprocess.run("kubectl apply -f -", input=deployment_yaml, shell=True, text=True, check=True)
            subprocess.run("kubectl apply -f -", input=service_yaml, shell=True, text=True, check=True)
            subprocess.run("kubectl apply -f -", input=ingress_yaml, shell=True, text=True, check=True)
        except subprocess.CalledProcessError as e:
            raise HTTPException(status_code=500, detail=f"Error deploying app for {url}: {str(e)}")

    return {"message": "Deployment successful for all domains"}
