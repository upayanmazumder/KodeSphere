Post installation, to configure the deployments, run

```
kubectl create clusterrolebinding api-server-admin \
  --clusterrole=cluster-admin \
  --serviceaccount=default:default
```