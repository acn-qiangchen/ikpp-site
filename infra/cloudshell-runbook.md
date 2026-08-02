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

## Part D — Admin upload feature setup (one-time)

This section sets up the admin interface for uploading evidence photos and YouTube video IDs.
Content appears on `https://ikpp.tink9.com/evidence` **without rebuilding or redeploying** the
static site — the evidence page fetches `content.json` from CloudFront at runtime in the browser.

### How it works

```
You (admin) → Vercel /admin page
  → POST /api/admin/upload-url → get pre-signed S3 PUT URL
  → PUT photo directly to S3 (browser → S3, bypasses Vercel)
  → POST /api/admin/content → write updated content.json to S3

Visitors → ikpp.tink9.com/evidence (static HTML from S3/CloudFront)
  → browser fetches https://ikpp.tink9.com/content.json at runtime
  → EvidenceMedia component renders photos and YouTube embeds
```

The Vercel deployment is only used for the admin UI. The production site at `ikpp.tink9.com`
is not affected by Vercel — it just reads `content.json` from the same S3 bucket.

---

### D-1. Apply the new Terraform resources (in CloudShell)

The `feature/admin-function` branch adds: S3 CORS config, a `vercel-admin` IAM user with
scoped S3 permissions, and sensitive outputs for the access key.

```bash
cd ~/ikpp-site
git pull   # pull merged main after the PR is merged

cd infra/terraform
# Re-create terraform.tfvars if this is a new session (see Part B)
terraform init -backend-config=$HOME/backend.hcl
terraform plan    # expect: 3 new resources (IAM user, access key, user policy) + 1 S3 CORS config
terraform apply
```

Retrieve the new IAM credentials:

```bash
terraform output -raw vercel_admin_aws_key_id
terraform output -raw vercel_admin_aws_secret
```

Save both values — you will need them in D-3.

---

### D-2. Upload the initial content.json to S3

This creates the empty content file that the evidence page reads from.
Replace `YOUR_BUCKET` with the value of `terraform output s3_bucket_name`.

```bash
echo '{"photos":[],"videos":[]}' | aws s3 cp - \
  s3://YOUR_BUCKET/content.json \
  --content-type application/json \
  --region ap-northeast-1
```

Verify it is accessible via CloudFront (may take ~30 s for propagation):

```bash
curl -s https://ikpp.tink9.com/content.json
# Expected: {"photos":[],"videos":[]}
```

---

### D-3. Deploy the admin UI to Vercel

The admin page (`/admin`) and API routes (`/api/admin/*`) require a server runtime and
cannot run on S3/CloudFront. Deploy the same repo to Vercel:

1. Go to [vercel.com](https://vercel.com) → **Add New Project** → import `acn-qiangchen/ikpp-site`
2. Leave build settings as default (Next.js auto-detected)
3. **Do not** set `NEXT_EXPORT=true` — Vercel runs Next.js natively with API routes enabled

Set these environment variables in **Vercel → Project → Settings → Environment Variables**:

| Variable | Value |
|---|---|
| `ADMIN_PASSWORD` | a strong password you choose |
| `ADMIN_AWS_ACCESS_KEY_ID` | from `terraform output -raw vercel_admin_aws_key_id` |
| `ADMIN_AWS_SECRET_ACCESS_KEY` | from `terraform output -raw vercel_admin_aws_secret` |
| `ADMIN_S3_BUCKET` | from `terraform output s3_bucket_name` (without quotes) |
| `ADMIN_AWS_REGION` | `ap-northeast-1` |

After setting env vars, trigger a redeploy in Vercel.

---

### D-4. Verify the admin flow

1. Visit `https://YOUR-PROJECT.vercel.app/admin` → login form appears
2. Enter the password set in D-3 → upload UI appears
3. Upload a photo → confirm `content.json` is updated:
   ```bash
   curl -s https://ikpp.tink9.com/content.json | python3 -m json.tool
   ```
4. Visit `https://ikpp.tink9.com/evidence` → photo appears (no rebuild needed)
5. Add a YouTube video ID → confirm embed appears on the evidence page

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
