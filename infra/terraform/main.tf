terraform {
  required_version = ">= 1.6"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Remote state — fill in your account ID, then run:
  #   terraform init -migrate-state
  # The runbook (infra/cloudshell-runbook.md) creates this bucket automatically.
  backend "s3" {
    bucket = "ikpp-tfstate-REPLACE_WITH_ACCOUNT_ID"
    key    = "ikpp/terraform.tfstate"
    region = "ap-northeast-1"
  }
}

provider "aws" {
  region = var.aws_region
}

# ACM certificates for CloudFront must be in us-east-1
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
}

data "aws_caller_identity" "current" {}

locals {
  tags = {
    Project   = var.project_name
    ManagedBy = "terraform"
  }
}
