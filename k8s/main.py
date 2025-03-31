from fastapi import FastAPI, HTTPException
import subprocess
from k8s_yaml import generate_deployment_yaml, generate_service_yaml, generate_ingress_yaml

app = FastAPI()

def apply_k8s_manifests(deployment_yaml: str, service_yaml: str, ingress_yaml: str) -> None:
    """Applies Kubernetes manifests using kubectl."""
    try:
        subprocess.run(["kubectl", "apply", "-f", "-"], input=deployment_yaml, text=True, check=True)
        subprocess.run(["kubectl", "apply", "-f", "-"], input=service_yaml, text=True, check=True)
        subprocess.run(["kubectl", "apply", "-f", "-"], input=ingress_yaml, text=True, check=True)
    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=500, detail=f"Error applying Kubernetes manifests: {str(e)}")

@app.post("/deploy")
async def deploy_app(payload: dict):
    image = payload.get("image")
    domains = payload.get("domains")
    env_vars = payload.get("env_vars", {})

    if not image or not domains:
        raise HTTPException(status_code=400, detail="Missing required fields")

    for domain in domains:
        url = domain.get("url")
        ports = domain.get("ports", [80])

        if not url or not ports:
            raise HTTPException(status_code=400, detail="Each domain must have a URL and ports")

        app_name = url.split(".")[0]

        deployment_yaml = generate_deployment_yaml(app_name, image, ports, env_vars)
        service_yaml = generate_service_yaml(app_name, ports)
        ingress_yaml = generate_ingress_yaml(app_name, url, ports)

        apply_k8s_manifests(deployment_yaml, service_yaml, ingress_yaml)

    return {"message": "Deployment successful for all domains"}
