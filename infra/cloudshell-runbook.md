# Terraform Deployment Runbook — AWS CloudShell

Run all commands in [AWS CloudShell](https://console.aws.amazon.com/cloudshell).  
CloudShell already has your AWS credentials — no access key setup needed.

---

## Part A — One-time setup (first time only)

### A-1. Install Terraform permanently via tfenv

`tfenv` is a Terraform version manager. Cloning it into `~/.tfenv` makes it survive
CloudShell session restarts because the home directory is persistent storage.

```bash
# Install tfenv
git clone https://github.com/tfutils/tfenv.git ~/.tfenv

# Wire it into ~/bin (also persistent)
mkdir -p ~/bin
ln -s ~/.tfenv/bin/* ~/bin/

# Add ~/bin to PATH for this session and all future sessions
export PATH="$HOME/bin:$PATH"
echo 'export PATH="$HOME/bin:$PATH"' >> ~/.bashrc

# Install latest Terraform and activate it
tfenv install latest
tfenv use latest

# Verify
terraform version
```

> **Next CloudShell session:** `~/.tfenv` and `~/bin` are already there.  
> PATH is restored automatically via `.bashrc`. Just run `terraform version` to confirm.

---

### A-2. Create the Terraform state S3 bucket

The state bucket must exist *before* `terraform init`. Create it once with the AWS CLI:

```bash
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
BUCKET_NAME="ikpp-tfstate-${ACCOUNT_ID}"
REGION="ap-northeast-1"

# Create bucket
aws s3api create-bucket \
  --bucket "${BUCKET_NAME}" \
  --region "${REGION}" \
  --create-bucket-configuration LocationConstraint="${REGION}"

# Block all public access
aws s3api put-public-access-block \
  --bucket "${BUCKET_NAME}" \
  --public-access-block-configuration \
    "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"

# Enable versioning (lets you recover from accidental state corruption)
aws s3api put-bucket-versioning \
  --bucket "${BUCKET_NAME}" \
  --versioning-configuration Status=Enabled

echo "State bucket: ${BUCKET_NAME}"
```

---

### A-3. Clone the repo and patch main.tf

```bash
# Replace YOUR_TOKEN with a GitHub PAT (repo scope)
# Create one at: https://github.com/settings/tokens/new?scopes=repo&description=CloudShell
git clone https://YOUR_TOKEN@github.com/acn-qiangchen/ikpp-site.git
cd ikpp-site

# Patch the backend bucket name in main.tf
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
sed -i "s/REPLACE_WITH_ACCOUNT_ID/${ACCOUNT_ID}/" infra/terraform/main.tf

# Verify the change
grep 'bucket' infra/terraform/main.tf
# Expected: bucket = "ikpp-tfstate-123456789012"
```

Commit and push the patched `main.tf` back to the repo so future CloudShell sessions
don't need to patch again:

```bash
git config user.email "qiang.chen@accenture.com"
git config user.name "Qiang Chen"
git add infra/terraform/main.tf
git commit -m "Set Terraform state bucket name"
git push origin feature/iac-ready
```

---

### A-4. Create terraform.tfvars

`terraform.tfvars` is git-ignored — create it in CloudShell each time you need it:

```bash
cat > infra/terraform/terraform.tfvars <<'EOF'
subdomain    = "ikpp"
root_domain  = "tink9.com"
project_name = "ikpp"
github_org   = "acn-qiangchen"
github_repo  = "ikpp-site"
aws_region   = "ap-northeast-1"
EOF
```

---

### A-5. Initialize and apply

```bash
cd ~/ikpp-site/infra/terraform

terraform init    # downloads providers, connects to S3 backend
terraform plan    # review: ~10 resources expected
terraform apply   # type "yes" — CloudFront creation takes ~10 min
```

---

### A-6. Copy outputs to GitHub secrets

```bash
terraform output
```

Open: **GitHub → Settings → Secrets and variables → Actions → New repository secret**

| Secret name | Terraform output key |
|---|---|
| `AWS_DEPLOY_ROLE_ARN` | `github_deploy_role_arn` |
| `AWS_REGION` | `aws_region` |
| `S3_BUCKET_NAME` | `s3_bucket_name` |
| `CLOUDFRONT_DISTRIBUTION_ID` | `cloudfront_distribution_id` |

---

### A-7. Update SITE_URL (on your local machine)

In `src/lib/data.ts`, change:

```ts
export const SITE_URL = "https://ikpp.tink9.com";
```

Then commit and push to `main` — GitHub Actions deploys automatically.

---

## Part B — Returning to an existing session

```bash
# PATH is restored from .bashrc automatically; confirm terraform is available
terraform version

cd ~/ikpp-site
git pull

cd infra/terraform

# Re-create terraform.tfvars (see A-4 above)
cat > terraform.tfvars <<'EOF'
subdomain    = "ikpp"
root_domain  = "tink9.com"
project_name = "ikpp"
github_org   = "acn-qiangchen"
github_repo  = "ikpp-site"
aws_region   = "ap-northeast-1"
EOF

terraform init    # re-initializes against the S3 backend (fast, no download if cached)
terraform plan
terraform apply
```

---

## Part C — Teardown (if needed)

```bash
cd ~/ikpp-site/infra/terraform
terraform destroy   # type "yes"
```

This removes: S3 site bucket, CloudFront distribution, ACM cert, Route 53 records, IAM role.  
It does **not** remove:
- The `tink9.com` hosted zone
- The `ikpp-tfstate-*` state bucket (delete manually if desired)
