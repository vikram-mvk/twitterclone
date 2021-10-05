terraform apply -auto-approve
gcloud container clusters get-credentials $(terraform output -raw kubernetes_cluster_name) --region us-east1-b
kubectl apply -f Kubernetes
PAUSE