variable "domain_name" {
  description = "Root domain registered in Route 53 (e.g. ikpp-site.com)"
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
