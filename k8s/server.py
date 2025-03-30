from fastapi import FastAPI, HTTPException
import subprocess
import yaml

app = FastAPI()

@app.post("/deploy")
async def deploy_app(payload: dict):
    image = payload.get("image")
    url = payload.get("url")
    ports = payload.get("ports", [80])  # Default to port 80

    if not image or not url or not ports:
        raise HTTPException(status_code=400, detail="Missing required fields")

    app_name = url.split(".")[0]  # Extract subdomain

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
""" for port in ports)

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
  - host: {url}
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: {app_name}-service
            port:
              number: {ports[0]}
  tls:
  - hosts:
    - {url}
    secretName: {app_name}-tls
"""

    # Apply Kubernetes manifests
    try:
        subprocess.run("kubectl apply -f -", input=deployment_yaml, shell=True, text=True, check=True)
        subprocess.run("kubectl apply -f -", input=service_yaml, shell=True, text=True, check=True)
        subprocess.run("kubectl apply -f -", input=ingress_yaml, shell=True, text=True, check=True)
    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=500, detail=f"Error deploying app: {str(e)}")

    return {"message": f"Deployment successful for {url}", "deployment": app_name}
