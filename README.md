# KodeSphere  

KodeSphere is a cloud-based deployment platform that allows users to deploy their applications using subdomains in the format:  

```
<subdomain>.<github-username>.vitians.in  
```

This is achieved using Docker images, port mapping, and environment variables.  

## 🌐 Live URLs  

- **Main App:** [ks.upayan.dev](https://ks.upayan.dev)  
- **API:** [api.ks.upayan.dev](https://api.ks.upayan.dev)  

## 📦 Docker Images  

- **Main KodeSphere Image:** [ghcr.io/upayanmazumder/kodesphere](https://github.com/users/upayanmazumder/packages/container/package/kodesphere)  
- **Kubernetes Deployment Image:** [ghcr.io/upayanmazumder/kodesphere/k8s](https://github.com/users/upayanmazumder/packages/container/package/kodesphere%2Fk8s)  

## 🖥️ Kubernetes Deployment  

The Kubernetes server for KodeSphere is hosted at:  

```
api.vitians.in  
```

It manages and orchestrates deployments for users.  

## 🎨 UI/UX Design  

Check out the Figma design for KodeSphere:  
[![Figma](https://www.figma.com/design/ID1d8pcH6fPSQIUY3grh2Z/Kodesphere?node-id=0-1&t=ZNYoePDGk3zLGvhr-1)](https://www.figma.com/design/ID1d8pcH6fPSQIUY3grh2Z/Kodesphere?node-id=0-1&t=ZNYoePDGk3zLGvhr-1)  

## 🚀 Features  

- Deploy applications using a structured subdomain system.  
- Use Docker images with port mapping and environment variables.  
- Kubernetes-based deployment and orchestration.  
- Secure and scalable hosting.  

## 🏗️ How It Works  

1. **Choose a Subdomain:**  
   Users select a subdomain under `vitians.in` (e.g., `myapp.user123.vitians.in`).  

2. **Provide a Docker Image:**  
   The platform supports Docker images, allowing users to specify the image, ports, and environment variables.  

3. **Deployment via API:**  
   The API at `api.ks.upayan.dev` handles the deployment process.  

4. **Access the Application:**  
   Once deployed, the application becomes accessible via the assigned subdomain.  

## 🛠️ Setup and Usage  

### Deploying a Site  

To deploy an application, send a request to the KodeSphere API with the necessary details:  

```json  
{
  "image": "<DOCKER IMAGE>",
  "domains": [
    {
      "url": "<CUSTOMIZABLE SUBDOMAIN 1>.<GITHUB USERNAME>.vitians.in",
      "ports": [<LIST OF PORTS TO USE FOR THIS SUBDOMAIN>]
    },
   {
      "url": "<CUSTOMIZABLE SUBDOMAIN 2>.<GITHUB USERNAME>.vitians.in",
      "ports": [<LIST OF PORTS TO USE FOR THIS SUBDOMAIN>]
    },
  ],
  "env_vars": {
    "ENVIRONMENT": "production",
    "DEBUG": "false",
    "API_KEY": "12345"
  }
}

```  

### Managing Deployments  

Users can update or remove their deployments through API endpoints.  

## 🏆 Team  

KodeSphere is built by **The Orchaestrators**.  