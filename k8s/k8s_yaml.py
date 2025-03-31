def generate_deployment_yaml(app_name: str, image: str, ports: list, env_vars: dict) -> str:
    """Generates Kubernetes Deployment YAML."""
    env_yaml = "".join(
        f"""
        - name: {key}
          value: "{value}"
        """ for key, value in env_vars.items()
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
""" for port in ports) + f"""
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
