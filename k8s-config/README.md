https://chatgpt.com/share/67e96b70-fb48-8008-a3a0-a1ce1a05505d

Post installation, to configure the deployments, run

```
kubectl create clusterrolebinding api-server-admin \
  --clusterrole=cluster-admin \
  --serviceaccount=default:default
```