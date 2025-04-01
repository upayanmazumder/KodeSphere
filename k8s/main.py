from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import subprocess
import tempfile
from typing import List, Dict, Optional

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://ks.upayan.dev"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/deploy")
async def deploy_app(payload: Dict):
    image: str = payload.get("image")
    domains: List[Dict] = payload.get("domains", [])
    deployment_name: Optional[str] = payload.get("name")
    env_vars: Dict[str, str] = payload.get("env", {})
    namespace: str = payload.get("namespace", "default")

    if not image or not domains:
        raise HTTPException(status_code=400, detail="Missing required fields: 'image' and 'domains' are required")

    for index, domain in enumerate(domains):
        url = domain.get("url")
        ports = domain.get("ports", [80])

        if not url or not ports:
            raise HTTPException(status_code=400, detail="Each domain must have a 'url' and 'ports'")

        unique_name = f"{deployment_name or url.split('.')[0]}-{index}"

        env_yaml = "\n".join(
            f"        - name: {key}\n          value: \"{value}\"" for key, value in env_vars.items()
        )

        deployment_yaml = f"""
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {unique_name}-deployment
  namespace: {namespace}
spec:
  replicas: 1
  selector:
    matchLabels:
      app: {unique_name}
  template:
    metadata:
      labels:
        app: {unique_name}
    spec:
      containers:
      - name: {unique_name}-container
        image: {image}
        ports:
""" + "".join(f"\n        - containerPort: {port}" for port in ports) + (
            f"\n        env:\n{env_yaml}" if env_vars else ""
        )

        service_yaml = f"""
apiVersion: v1
kind: Service
metadata:
  name: {unique_name}-service
  namespace: {namespace}
spec:
  selector:
    app: {unique_name}
  ports:
""" + "".join(f"\n  - protocol: TCP\n    port: {port}\n    targetPort: {port}" for port in ports)

        ingress_yaml = f"""
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: {unique_name}-ingress
  namespace: {namespace}
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-dns
spec:
  ingressClassName: nginx
  rules:
  - host: {url}
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: {unique_name}-service
            port:
              number: {ports[0]}
  tls:
  - hosts:
    - {url}
    secretName: wildcard-tls  # Use the wildcard certificate
"""


        try:
            for resource_name, yaml_content in [
                (f"{unique_name}-deployment.yaml", deployment_yaml),
                (f"{unique_name}-service.yaml", service_yaml),
                (f"{unique_name}-ingress.yaml", ingress_yaml),
            ]:
                with tempfile.NamedTemporaryFile("w", delete=False, suffix=".yaml") as temp_file:
                    temp_file.write(yaml_content)
                    temp_file.flush()
                    subprocess.run(["kubectl", "apply", "-f", temp_file.name], check=True)

        except subprocess.CalledProcessError as e:
            raise HTTPException(status_code=500, detail=f"Error deploying {unique_name}: {str(e)}")

    return {"message": "Deployment successful for all domains"}
