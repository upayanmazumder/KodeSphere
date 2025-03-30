from fastapi import FastAPI, HTTPException
import subprocess

app = FastAPI()

@app.post("/deploy")
async def deploy_app(payload: dict):
    image = payload.get("image")
    if not image:
        raise HTTPException(status_code=400, detail="Missing required field: image")

    # Default values
    namespace = payload.get("namespace", "default")
    ports = payload.get("ports", [80])
    domains = payload.get("domains", [])
    env_vars = payload.get("env", {})
    resources = payload.get("resources", {
        "requests": {"cpu": "250m", "memory": "512Mi"},
        "limits": {"cpu": "500m", "memory": "1Gi"}
    })
    autoscaling = payload.get("autoscaling", {"enabled": False})
    storage = payload.get("storage", {"enabled": False})

    app_name = image.split(":")[0].replace("/", "-")

    # Deployment YAML
    deployment_yaml = f"""
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {app_name}-deployment
  namespace: {namespace}
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
""" for key, value in env_vars.items()) + f"""
        resources:
          requests:
            cpu: {resources["requests"]["cpu"]}
            memory: {resources["requests"]["memory"]}
          limits:
            cpu: {resources["limits"]["cpu"]}
            memory: {resources["limits"]["memory"]}
"""

    # Service YAML
    service_yaml = f"""
apiVersion: v1
kind: Service
metadata:
  name: {app_name}-service
  namespace: {namespace}
spec:
  selector:
    app: {app_name}
  ports:
""" + "".join(f"""
  - protocol: TCP
    port: {port}
    targetPort: {port}
""" for port in ports)

    # Ingress YAML (only if domains are provided)
    ingress_yaml = ""
    if domains:
        ingress_yaml = f"""
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: {app_name}-ingress
  namespace: {namespace}
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
              number: {ports[0]}
  tls:
  - hosts:
    - {domain}
    secretName: {app_name}-tls
""" for domain in domains)

    # Apply Kubernetes manifests
    try:
        subprocess.run("kubectl apply -f -", input=deployment_yaml, shell=True, text=True, check=True)
        subprocess.run("kubectl apply -f -", input=service_yaml, shell=True, text=True, check=True)
        if ingress_yaml:
            subprocess.run("kubectl apply -f -", input=ingress_yaml, shell=True, text=True, check=True)
    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=500, detail=f"Error deploying app: {str(e)}")

    return {
        "message": f"Deployment successful for {app_name}",
        "namespace": namespace,
        "deployment": app_name,
        "ports": ports,
        "domains": domains
    }
