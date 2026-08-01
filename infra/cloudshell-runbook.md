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

The state bucket must exist *before* `terraform init`. The bucket name uses a random
suffix — your AWS account ID never appears in any file that gets committed to git.

```bash
# Generate a random 8-char suffix (no account ID)
SUFFIX=$(openssl rand -hex 4)
BUCKET_NAME="ikpp-tfstate-${SUFFIX}"
REGION="ap-northeast-1"

# Create the bucket
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

echo "State bucket created: ${BUCKET_NAME}"
echo "Save this name — you will need it in the next step."
```

---

### A-3. Create backend.hcl (git-ignored)

`backend.hcl` holds the state bucket name. It is listed in `.gitignore` so it never
gets committed. You create it once in CloudShell — it lives in `~/` (persistent).

```bash
# Replace ikpp-tfstate-XXXXXXXX with the bucket name printed in A-2
cat > $HOME/backend.hcl <<EOF
bucket = "${BUCKET_NAME}"
key    = "ikpp/terraform.tfstate"
region = "ap-northeast-1"
EOF

cat $HOME/backend.hcl   # confirm it looks correct
```

---

### A-4. Clone the repo

```bash
# Replace YOUR_TOKEN with a GitHub PAT (repo scope)
# Create one at: https://github.com/settings/tokens/new?scopes=repo&description=CloudShell
git clone https://YOUR_TOKEN@github.com/acn-qiangchen/ikpp-site.git
cd ikpp-site
```

---

### A-5. Create terraform.tfvars (git-ignored)

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

### A-6. Initialize and apply

```bash
cd ~/ikpp-site/infra/terraform

# -backend-config points to the git-ignored file with your bucket name
terraform init -backend-config=$HOME/backend.hcl
terraform plan    # review: ~10 resources expected
terraform apply   # type "yes" — CloudFront creation takes ~10 min
```

---

### A-7. Copy outputs to GitHub secrets

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

### A-8. Update SITE_URL (on your local machine)

In `src/lib/data.ts`, change:

```ts
export const SITE_URL = "https://ikpp.tink9.com";
```

Then commit and push to `main` — GitHub Actions deploys automatically.

---

## Part B — Returning to an existing CloudShell session

`~/.tfenv`, `~/bin`, `~/backend.hcl` all persist — no reinstall needed.

```bash
terraform version   # confirm it's available

cd ~/ikpp-site
git pull

# Re-create terraform.tfvars (git-ignored, not persisted in repo)
cat > infra/terraform/terraform.tfvars <<'EOF'
subdomain    = "ikpp"
root_domain  = "tink9.com"
project_name = "ikpp"
github_org   = "acn-qiangchen"
github_repo  = "ikpp-site"
aws_region   = "ap-northeast-1"
EOF

cd infra/terraform
terraform init -backend-config=$HOME/backend.hcl
terraform plan
terraform apply
```

---

## Part C — Teardown (if needed)

```bash
cd ~/ikpp-site/infra/terraform
terraform destroy   # type "yes"
```

Removes: S3 site bucket, CloudFront distribution, ACM cert, Route 53 records, IAM role.

Does **not** remove:

- The `tink9.com` hosted zone
- The `ikpp-tfstate-*` state bucket (delete manually if desired)
