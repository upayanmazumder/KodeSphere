# kodesphere  

kodesphere is a cloud-based deployment platform that allows users to deploy their applications using subdomains in the format:  

```
<subdomain>.<github-username>.vitians.in  
```

This is achieved through Docker, Kubernetes, and Ingress. 

## 🌐 Live URLs  

- **Main App:** [ks.upayan.dev](https://ks.upayan.dev)  
- **API:** [api.ks.upayan.dev](https://api.ks.upayan.dev)
- **K8s API:** [api.vitians.in](https://api.vitians.in )

## 📦 Docker Images  

- **Main kodesphere Image:** [ghcr.io/upayanmazumder/kodesphere](https://github.com/users/upayanmazumder/packages/container/package/kodesphere)  
- **Kubernetes Deployment Image:** [ghcr.io/upayanmazumder/kodesphere/k8s](https://github.com/users/upayanmazumder/packages/container/package/kodesphere%2Fk8s)  

## 🖥️ Kubernetes Deployment  

The Kubernetes server for kodesphere is hosted at:  

```
api.vitians.in  
```

It manages and orchestrates deployments for users.  

## 🎨 UI/UX Design  

Check out the Figma design for kodesphere:  
[Figma](https://www.figma.com/design/ID1d8pcH6fPSQIUY3grh2Z/kodesphere?node-id=0-1&t=ZNYoePDGk3zLGvhr-1)

## 🚀 Features  

- Deploy applications using a structured subdomain system.  
- Use Docker images with port mapping and environment variables.  
- Kubernetes-based deployment and orchestration.  
- Secure and scalable hosting.  

## 🏗️ How It Works  

Check out the [presentation](https://www.figma.com/design/ID1d8pcH6fPSQIUY3grh2Z/Kodesphere?node-id=165-253&t=huiVNv0PjfaApOuP-1) and more in [assets](/assets/)!

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

To deploy an application, send a request to the kodesphere API with the necessary details:  

```json  
{
  "image": "your-docker-image:latest",
  "domains": [
    {
      "url": "example.com",
      "ports": [80, 443]
    }
  ],
  "name": "my-app",
  "env": {
    "ENV_VAR1": "value1",
    "ENV_VAR2": "value2"
  },
  "namespace": "custom-namespace"
}

```  

### Managing Deployments  

Users can update or remove their deployments through API endpoints.  

## 🏆 Team  

kodesphere is built by **The Orchaestrators**.  

- **[Upayan Mazumder](https://upayan.dev)** - [LinkedIn](https://www.linkedin.com/in/upayanmazumder/)  
- **[Atharva Sharma](https://atharvasharma.vercel.app/)** - [LinkedIn](https://www.linkedin.com/in/atharva-sharma-vit/)  
- **Advik Gupta** - [LinkedIn](https://www.linkedin.com/in/advik-gupta-37a557308)  
- **Chitrita Gahlot** - [LinkedIn](https://in.linkedin.com/in/chitrita-gahlot-72a905321)
- **Diya Bajoria** - [LinkedIn](https://www.linkedin.com/in/diya-bajoria-375367335/?trk=opento_sprofile_topcard)
