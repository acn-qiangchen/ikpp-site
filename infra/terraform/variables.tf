variable "subdomain" {
  description = "Subdomain for this site (e.g. ikpp)"
  type        = string
  default     = "ikpp"
}

variable "root_domain" {
  description = "Root domain whose Route 53 hosted zone already exists (e.g. tink9.com)"
  type        = string
}

variable "project_name" {
  description = "Short identifier used in resource names and tags"
  type        = string
  default     = "ikpp"
}

variable "github_org" {
  description = "GitHub username or organization that owns the repo"
  type        = string
}

variable "github_repo" {
  description = "GitHub repository name"
  type        = string
}

variable "aws_region" {
  description = "AWS region for S3 and other regional resources"
  type        = string
  default     = "ap-northeast-1"
}

locals {
  fqdn = "${var.subdomain}.${var.root_domain}"
}
