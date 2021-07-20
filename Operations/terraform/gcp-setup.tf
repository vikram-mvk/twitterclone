
provider "google" {
  project = var.project_id
  region  = var.region_gcp
}

# GCP Bucket public access rule
resource "google_storage_default_object_access_control" "public_rule" {
  bucket = google_storage_bucket.bucket.name
  role   = "READER"
  entity = "allUsers"
}

# Create a GCS Bucket
resource "google_storage_bucket" "bucket" {
  name          = var.bucket_name
  project       = var.project_id
  force_destroy = true
  storage_class = "standard"
  location      = "US"
}

# GKE cluster
resource "google_container_cluster" "primary" {

  name                     = "twitterclone-cluster"
  location                 = var.region_gcp
  remove_default_node_pool = true
  initial_node_count       = var.node_count

  master_auth {
    username = ""
    password = ""

    client_certificate_config {
      issue_client_certificate = false
    }
  }
}

# GKE node pools
resource "google_container_node_pool" "primary_preemptible_nodes" {

  name       = "twitterclone-node-pool"
  location   = var.region_gcp
  cluster    = google_container_cluster.primary.name
  node_count = var.node_pool_count

  node_config {
    preemptible  = true
    machine_type = var.node_pool_machine_type

    metadata = {
      disable-legacy-endpoints = "true"
    }

    oauth_scopes = [
      "https://www.googleapis.com/auth/cloud-platform"
    ]
  }
}

output "kubernetes_cluster_name" {
  value       = google_container_cluster.primary.name
  description = "GKE Cluster Name"
}
