# Terraform Deployment Runbook — AWS CloudShell

Run all commands in [AWS CloudShell](https://console.aws.amazon.com/cloudshell).  
CloudShell already has your AWS credentials — no access key setup needed.

> **Persistence note:** CloudShell's home directory (`~/`) survives session restarts.  
> System paths (`/usr/local/bin`) do not. This runbook installs Terraform into `~/bin/` so you only need to do the install once.

---

## 1. Install Terraform (one-time)

```bash
# Create a persistent bin directory
mkdir -p ~/bin

# Download Terraform 1.9 (latest 1.x as of mid-2025)
TF_VERSION=1.9.8
curl -sLo /tmp/terraform.zip \
  https://releases.hashicorp.com/terraform/${TF_VERSION}/terraform_${TF_VERSION}_linux_amd64.zip
unzip -o /tmp/terraform.zip -d ~/bin
rm /tmp/terraform.zip

# Add ~/bin to PATH for this session (already in PATH on next login via .bashrc)
export PATH="$HOME/bin:$PATH"
echo 'export PATH="$HOME/bin:$PATH"' >> ~/.bashrc

# Verify
terraform version
```

---

## 2. Clone the repository

CloudShell has `git` pre-installed. Use a [GitHub Personal Access Token](https://github.com/settings/tokens/new?scopes=repo&description=CloudShell) (classic, `repo` scope) for HTTPS auth.

```bash
# Replace YOUR_TOKEN with your GitHub PAT
git clone https://YOUR_TOKEN@github.com/acn-qiangchen/ikpp-site.git
cd ikpp-site
```

> If you already cloned in a previous session:
> ```bash
> cd ikpp-site && git pull
> ```

---

## 3. Create terraform.tfvars

`terraform.tfvars` is git-ignored, so you create it manually each time (it's small):

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

## 4. Initialize and apply

```bash
cd infra/terraform

terraform init
terraform plan    # review what will be created — expected: ~10 resources
terraform apply   # type "yes" when prompted
```

CloudFront distribution creation takes **~10 minutes** — Terraform waits automatically.

---

## 5. Copy outputs to GitHub secrets

After `apply` completes, run:

```bash
terraform output
```

Open your repo: **GitHub → Settings → Secrets and variables → Actions → New repository secret**

| Secret name | Terraform output key |
|---|---|
| `AWS_DEPLOY_ROLE_ARN` | `github_deploy_role_arn` |
| `AWS_REGION` | `aws_region` |
| `S3_BUCKET_NAME` | `s3_bucket_name` |
| `CLOUDFRONT_DISTRIBUTION_ID` | `cloudfront_distribution_id` |

---

## 6. Update SITE_URL and deploy

Back on your **local machine**:

```bash
# Edit src/lib/data.ts — replace the placeholder with the real URL
# Change: export const SITE_URL = "https://ikpp.example.com";
# To:     export const SITE_URL = "https://ikpp.tink9.com";
```

Then commit and push to `main`:

```bash
git add src/lib/data.ts
git commit -m "Set SITE_URL to https://ikpp.tink9.com"
git push origin main
```

GitHub Actions picks up the push, builds the static export, and syncs to S3 + invalidates CloudFront automatically.

---

## Re-running in a new CloudShell session

```bash
export PATH="$HOME/bin:$PATH"   # restore PATH (already in .bashrc — or just open a new tab)
terraform version               # confirm terraform is available

cd ~/ikpp-site
git pull

cd infra/terraform
# Re-create terraform.tfvars (see step 3 above)
terraform apply
```

---

## Teardown (if needed)

```bash
cd ~/ikpp-site/infra/terraform
terraform destroy   # destroys all resources managed by this config
```

> This removes the S3 bucket, CloudFront distribution, ACM cert, Route 53 records, and IAM role.  
> It does **not** remove the `tink9.com` hosted zone itself.
