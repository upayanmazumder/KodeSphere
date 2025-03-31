from fastapi import FastAPI, HTTPException
import subprocess
from typing import List, Dict, Optional

app = FastAPI()

@app.post("/deploy")
async def deploy_app(payload: Dict):
    image: str = payload.get("image")
    domains: List[Dict] = payload.get("domains", [])
    deployment_name: Optional[str] = payload.get("name")
    env_vars: Dict[str, str] = payload.get("env", {})

    if not image or not domains:
        raise HTTPException(status_code=400, detail="Missing required fields")

    for domain in domains:
        url = domain.get("url")
        ports = domain.get("ports", [80])

        if not url or not ports:
            raise HTTPException(status_code=400, detail="Each domain must have a URL and ports")

        app_name = deployment_name or url.split(".")[0]

        env_yaml = "\n".join(
            f"        - name: {key}\n          value: \"{value}\"" for key, value in env_vars.items()
        )

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
""" + "".join(f"\n        - containerPort: {port}" for port in ports) + (
            f"\n        env:\n{env_yaml}" if env_vars else ""
        )

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
""" + "".join(f"\n  - protocol: TCP\n    port: {port}\n    targetPort: {port}" for port in ports)

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
  - host: {url}
    http:
      paths:
""" + "".join(f"\n      - path: /\n        pathType: Prefix\n        backend:\n          service:\n            name: {app_name}-service\n            port:\n              number: {port}" for port in ports) + f"""
  tls:
  - hosts:
    - {url}
    secretName: {app_name}-tls
"""

        try:
            subprocess.run("kubectl apply -f -", input=deployment_yaml, shell=True, text=True, check=True)
            subprocess.run("kubectl apply -f -", input=service_yaml, shell=True, text=True, check=True)
            subprocess.run("kubectl apply -f -", input=ingress_yaml, shell=True, text=True, check=True)
        except subprocess.CalledProcessError as e:
            raise HTTPException(status_code=500, detail=f"Error deploying app for {url}: {str(e)}")

    return {"message": "Deployment successful for all domains"}
