# Infrastructure (Terraform)

Manages: S3 bucket, CloudFront distribution, ACM certificate, Route 53 DNS, GitHub Actions IAM role.

## Prerequisites

- Terraform ≥ 1.6 — `brew install terraform`
- AWS CLI configured — `aws configure` (or use SSO)
- Domain registered in Route 53 (see step 1 below)

---

## Step 1 — Register your domain in Route 53

Route 53 can't be automated for initial registration (requires billing consent). Do this once via the console:

1. Open [Route 53 → Domains → Register domain](https://console.aws.amazon.com/route53/domains/home#/)
2. Search for your domain, add to cart, fill in registrant details, complete purchase
3. Wait for the confirmation email (~15 min for most TLDs)
4. Route 53 automatically creates a hosted zone — **do not delete it**

---

## Step 2 — Configure variables

```bash
cd infra/terraform
cp terraform.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars`:

```hcl
domain_name  = "your-domain.com"    # domain you registered above
project_name = "ikpp"
github_org   = "acn-qiangchen"      # your GitHub username
github_repo  = "ikpp-site"
aws_region   = "ap-northeast-1"
```

---

## Step 3 — Apply

```bash
terraform init
terraform plan   # review what will be created
terraform apply
```

ACM certificate validation runs automatically via Route 53 DNS records.
CloudFront creation takes ~10 minutes — Terraform waits for it.

---

## Step 4 — Set GitHub Actions secrets

Copy the values printed by `terraform output` and add them to your repo:  
**GitHub → Settings → Secrets and variables → Actions**

| Secret | Terraform output |
|---|---|
| `AWS_DEPLOY_ROLE_ARN` | `github_deploy_role_arn` |
| `AWS_REGION` | `aws_region` |
| `S3_BUCKET_NAME` | `s3_bucket_name` |
| `CLOUDFRONT_DISTRIBUTION_ID` | `cloudfront_distribution_id` |

---

## Step 5 — Update SITE_URL

In `src/lib/data.ts`, update:

```ts
export const SITE_URL = "https://your-domain.com";  // from terraform output site_url
```

Commit and push to `main` — GitHub Actions builds and deploys automatically.

---

## What gets created

| Resource | Notes |
|---|---|
| `aws_s3_bucket` | Private, versioning enabled, OAC-only access |
| `aws_cloudfront_distribution` | HTTPS-only, PriceClass_200, custom error → 404.html |
| `aws_acm_certificate` | us-east-1 (CloudFront requirement), DNS-validated |
| `aws_route53_record` (A alias) | Apex + www → CloudFront |
| `aws_iam_role` | GitHub OIDC deploy role, scoped to S3 + CloudFront invalidation |
| `aws_iam_openid_connect_provider` | One per AWS account — `ignore_changes` prevents conflicts |
