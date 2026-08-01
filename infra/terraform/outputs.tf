output "site_url" {
  description = "Update SITE_URL in src/lib/data.ts to this value"
  value       = "https://${local.fqdn}"
}

output "cloudfront_domain" {
  description = "CloudFront-assigned domain (useful for DNS debugging)"
  value       = aws_cloudfront_distribution.site.domain_name
}

output "cloudfront_distribution_id" {
  description = "→ GitHub secret: CLOUDFRONT_DISTRIBUTION_ID"
  value       = aws_cloudfront_distribution.site.id
}

output "s3_bucket_name" {
  description = "→ GitHub secret: S3_BUCKET_NAME"
  value       = aws_s3_bucket.site.id
}

output "github_deploy_role_arn" {
  description = "→ GitHub secret: AWS_DEPLOY_ROLE_ARN"
  value       = aws_iam_role.github_deploy.arn
}

output "aws_region" {
  description = "→ GitHub secret: AWS_REGION"
  value       = var.aws_region
}
