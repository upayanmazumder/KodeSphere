from fastapi import FastAPI, HTTPException
import subprocess
import tempfile
import os

app = FastAPI()

def apply_k8s_manifest(manifest_content: str):
    """Safely apply a Kubernetes manifest using a temporary file."""
    with tempfile.NamedTemporaryFile(delete=False, suffix=".yaml") as temp_file:
        temp_file.write(manifest_content.encode())
        temp_file_path = temp_file.name

    try:
        subprocess.run(["kubectl", "apply", "-f", temp_file_path], check=True, text=True)
    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=500, detail=f"Error deploying app: {str(e)}")
    finally:
        os.remove(temp_file_path)  # Cleanup temp file

@app.post("/deploy")
async def deploy_app(payload: dict):
    image = payload.get("image")
    domains = payload.get("domains")  # Dictionary { "domain.com": port }
    ports = payload.get("ports", [])  # List of exposed ports
    env_vars = payload.get("env", {})  # Dictionary of environment variables

    if not image or not domains or not isinstance(domains, dict) or not ports:
        raise HTTPException(status_code=400, detail="Invalid or missing required fields")

    # Extract app name from the first domain
    app_name = list(domains.keys())[0].split(".")[0]  

    # Generate Kubernetes YAML files
    deployment_yaml = f"""
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
""" for port in ports) + """
        env:
""" + "".join(f"""
        - name: {key}
          value: "{value}"
""" for key, value in env_vars.items())

    service_yaml = f"""
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

    ingress_yaml = f"""
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
""" + "".join(f"""
  - host: {domain}
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: {app_name}-service
            port:
              number: {port}
""" for domain, port in domains.items()) + """
  tls:
""" + "".join(f"""
  - hosts:
    - {domain}
    secretName: {app_name}-tls
""" for domain in domains.keys())

    try:
        apply_k8s_manifest(deployment_yaml)
        apply_k8s_manifest(service_yaml)
        apply_k8s_manifest(ingress_yaml)
    except HTTPException as e:
        raise e  # Forward the error response

    return {"message": f"Deployment successful for {list(domains.keys())}", "deployment": app_name}
