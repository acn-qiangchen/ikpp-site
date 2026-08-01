# Infrastructure (Terraform)

Manages: S3 bucket, CloudFront distribution, ACM certificate, Route 53 DNS record for `ikpp.tink9.com`, GitHub Actions IAM role.

> **Running on AWS CloudShell?** Use the step-by-step guide in [`infra/cloudshell-runbook.md`](../cloudshell-runbook.md) instead — it covers tfenv install, state bucket creation, and `backend.hcl` setup.

## Prerequisites

- Terraform ≥ 1.6
  - Local Mac: `brew install terraform`
  - CloudShell: see [`infra/cloudshell-runbook.md`](../cloudshell-runbook.md) Part A-1
- AWS credentials configured (`aws configure`, SSO, or CloudShell ambient credentials)
- `tink9.com` hosted zone already exists in Route 53

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

## Step 2 — Create the state bucket and backend.hcl

The S3 backend bucket must exist before `terraform init`. Create it once:

```bash
SUFFIX=$(openssl rand -hex 4)
BUCKET_NAME="ikpp-tfstate-${SUFFIX}"
REGION="ap-northeast-1"

aws s3api create-bucket --bucket "${BUCKET_NAME}" --region "${REGION}" \
  --create-bucket-configuration LocationConstraint="${REGION}"
aws s3api put-public-access-block --bucket "${BUCKET_NAME}" \
  --public-access-block-configuration \
  "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
aws s3api put-bucket-versioning --bucket "${BUCKET_NAME}" \
  --versioning-configuration Status=Enabled
```

Then create `backend.hcl` (git-ignored — never committed):

```bash
cat > $HOME/backend.hcl <<EOF
bucket = "${BUCKET_NAME}"
key    = "ikpp/terraform.tfstate"
region = "ap-northeast-1"
EOF
```

---

## Step 3 — Apply

```bash
terraform init -backend-config=$HOME/backend.hcl
terraform plan    # review what will be created
terraform apply
```

Terraform will:

1. Generate a random suffix for the S3 site bucket name (no account ID exposed)
2. Create an S3 bucket (private, OAC-only)
3. Request an ACM certificate for `ikpp.tink9.com` in `us-east-1`
4. Add DNS validation records to the `tink9.com` hosted zone and wait for validation
5. Create the CloudFront distribution (~10 min)
6. Add an A alias record `ikpp.tink9.com → CloudFront`
7. Create the GitHub Actions OIDC deploy role

---

## Step 4 — Set GitHub Actions secrets

```bash
terraform output
```

Open: **GitHub → Settings → Secrets and variables → Actions**

| Secret | Terraform output |
|---|---|
| `AWS_DEPLOY_ROLE_ARN` | `github_deploy_role_arn` |
| `AWS_REGION` | `aws_region` |
| `S3_BUCKET_NAME` | `s3_bucket_name` |
| `CLOUDFRONT_DISTRIBUTION_ID` | `cloudfront_distribution_id` |

---

## Step 5 — Update SITE_URL

In `src/lib/data.ts`:

```ts
export const SITE_URL = "https://ikpp.tink9.com";
```

Commit and push to `main` — GitHub Actions builds and deploys automatically.

---

## What gets created

| Resource | Notes |
|---|---|
| `aws_s3_bucket` | Name: `ikpp-site-<random>`, private, versioning enabled |
| `aws_cloudfront_distribution` | HTTPS-only, PriceClass_200, custom error → 404.html |
| `aws_acm_certificate` | `ikpp.tink9.com`, us-east-1, DNS-validated |
| `aws_route53_record` (A alias) | `ikpp.tink9.com` → CloudFront, added to `tink9.com` zone |
| `aws_iam_role` | GitHub OIDC deploy role, scoped to this S3 bucket + CloudFront |
| `aws_iam_openid_connect_provider` | One per AWS account — `ignore_changes` prevents conflicts |
