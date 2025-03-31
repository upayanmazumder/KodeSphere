from fastapi import FastAPI, HTTPException
import subprocess
import re

app = FastAPI()

def apply_k8s_manifests(yamls: list[str]) -> None:
    """Applies multiple Kubernetes manifests"""
    yaml_combined = "\n---\n".join(yamls)
    try:
        subprocess.run(
            ["kubectl", "apply", "-f", "-"],
            input=yaml_combined,
            text=True,
            check=True,
            capture_output=True
        )
    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=500, detail=f"Kubectl error: {e.stderr or e.stdout}")

def sanitize_app_name(domain: str) -> str:
    """Ensures the app name is a valid Kubernetes DNS-1035 label"""
    app_name = re.sub(r"[^a-z0-9-]", "-", domain.lower())
    if not app_name[0].isalpha():
        app_name = "app-" + app_name
    return app_name.strip("-")

def generate_deployment_yaml(app_name: str, image: str, ports: list, env_vars: dict) -> str:
    """Generates Kubernetes Deployment YAML."""
    env_yaml = "\n".join(
        f"        - name: {key}\n          value: \"{value}\"" for key, value in env_vars.items()
    ) if env_vars else ""

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
      app: "{app_name}"
  template:
    metadata:
      labels:
        app: "{app_name}"
    spec:
      containers:
      - name: {app_name}-container
        image: {image}
        ports:
""" + "".join(f"\n        - containerPort: {port}" for port in ports) + f"""
        env:
{env_yaml}
"""

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
    app: "{app_name}"
  ports:
""" + "".join(f"""
  - protocol: TCP
    port: {port}
    targetPort: {port}""" for port in ports) + """
  type: ClusterIP
"""

def generate_ingress_yaml(app_name: str, domains: list) -> str:
    """Generates Kubernetes Ingress YAML supporting multiple domains."""
    rules_yaml = "".join(f"""
  - host: {domain['url']}
    http:
      paths:
""" + "".join(f"""
      - path: /
        pathType: Prefix
        backend:
          service:
            name: "{app_name}-service"
            port:
              number: {port}
""" for port in domain['ports']) for domain in domains)

    tls_yaml = "\n".join(f"  - hosts:\n    - {domain['url']}\n    secretName: {app_name}-tls" for domain in domains)

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
{rules_yaml}
  tls:
{tls_yaml}
"""

@app.post("/deploy")
async def deploy_app(payload: dict):
    image = payload.get("image")
    domains = payload.get("domains")
    env_vars = payload.get("env_vars", {})

    if not image or not domains:
        raise HTTPException(status_code=400, detail="Missing required fields")

    app_name = sanitize_app_name(domains[0]["url"].split(".")[0])

    ports = set()
    for domain in domains:
        if not domain.get("url") or not domain.get("ports"):
            raise HTTPException(status_code=400, detail="Each domain must have a URL and ports")
        ports.update(domain["ports"])

    deployment_yaml = generate_deployment_yaml(app_name, image, list(ports), env_vars)
    service_yaml = generate_service_yaml(app_name, list(ports))
    ingress_yaml = generate_ingress_yaml(app_name, domains)

    apply_k8s_manifests([deployment_yaml, service_yaml, ingress_yaml])

    return {"message": "Deployment successful"}
