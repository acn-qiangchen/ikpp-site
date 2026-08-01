# Infrastructure (Terraform)

Manages: S3 bucket, CloudFront distribution, ACM certificate, Route 53 DNS record for `ikpp.tink9.com`, GitHub Actions IAM role.

## Prerequisites

- Terraform ≥ 1.6 — `brew install terraform`
- AWS CLI configured — `aws configure` (or SSO)
- `tink9.com` hosted zone already exists in Route 53 (it does)

---

## Step 1 — Configure variables

```bash
cd infra/terraform
cp terraform.tfvars.example terraform.tfvars
```

`terraform.tfvars` is pre-filled for this project:

```hcl
subdomain    = "ikpp"
root_domain  = "tink9.com"
project_name = "ikpp"
github_org   = "acn-qiangchen"
github_repo  = "ikpp-site"
aws_region   = "ap-northeast-1"
```

---

## Step 2 — Apply

```bash
terraform init
terraform plan   # review what will be created
terraform apply
```

Terraform will:
1. Create an S3 bucket (private, OAC-only)
2. Request an ACM certificate for `ikpp.tink9.com` in `us-east-1`
3. Add DNS validation records to the `tink9.com` hosted zone and wait for validation
4. Create the CloudFront distribution (~10 min)
5. Add an A alias record `ikpp.tink9.com → CloudFront`
6. Create the GitHub Actions OIDC deploy role

---

## Step 3 — Set GitHub Actions secrets

Copy the values from `terraform output` into your repo:  
**GitHub → Settings → Secrets and variables → Actions**

| Secret | Terraform output |
|---|---|
| `AWS_DEPLOY_ROLE_ARN` | `github_deploy_role_arn` |
| `AWS_REGION` | `aws_region` |
| `S3_BUCKET_NAME` | `s3_bucket_name` |
| `CLOUDFRONT_DISTRIBUTION_ID` | `cloudfront_distribution_id` |

---

## Step 4 — Update SITE_URL

In `src/lib/data.ts`:

```ts
export const SITE_URL = "https://ikpp.tink9.com";
```

Commit and push to `main` — GitHub Actions builds and deploys automatically.

---

## What gets created

| Resource | Notes |
|---|---|
| `aws_s3_bucket` | Private, versioning enabled, OAC-only access |
| `aws_cloudfront_distribution` | HTTPS-only, PriceClass_200, custom error → 404.html |
| `aws_acm_certificate` | `ikpp.tink9.com`, us-east-1, DNS-validated |
| `aws_route53_record` (A alias) | `ikpp.tink9.com` → CloudFront, added to `tink9.com` zone |
| `aws_iam_role` | GitHub OIDC deploy role, scoped to this S3 bucket + CloudFront |
| `aws_iam_openid_connect_provider` | One per AWS account — `ignore_changes` prevents conflicts if it already exists |
