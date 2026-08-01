# AWS Infrastructure Setup

## S3 Bucket

```bash
aws s3api create-bucket \
  --bucket YOUR_BUCKET_NAME \
  --region ap-northeast-1 \
  --create-bucket-configuration LocationConstraint=ap-northeast-1

# Block all public access (CloudFront accesses via OAC)
aws s3api put-public-access-block \
  --bucket YOUR_BUCKET_NAME \
  --public-access-block-configuration \
    "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
```

## CloudFront Distribution

Create via console or CDK:
- Origin: S3 bucket (with Origin Access Control)
- Default root object: `index.html`
- Custom error responses:
  - 403 → `/404.html` (HTTP 404)
  - 404 → `/404.html` (HTTP 404)
- Price class: PriceClass_200 (North America, Europe, Asia)
- Alternate domain: your domain
- SSL: ACM certificate (us-east-1)

## GitHub Actions Secrets

Set these in repo Settings → Secrets → Actions:

| Secret | Value |
|---|---|
| `AWS_DEPLOY_ROLE_ARN` | IAM Role ARN for OIDC (see below) |
| `AWS_REGION` | `ap-northeast-1` |
| `S3_BUCKET_NAME` | Your bucket name |
| `CLOUDFRONT_DISTRIBUTION_ID` | CloudFront distribution ID |
| `NEXT_PUBLIC_API_BASE_URL` | API Gateway URL (when ready) |

## IAM Role for GitHub Actions (OIDC)

Trust policy — replace `GITHUB_ORG/REPO`:

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {
      "Federated": "arn:aws:iam::ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com"
    },
    "Action": "sts:AssumeRoleWithWebIdentity",
    "Condition": {
      "StringEquals": {
        "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
      },
      "StringLike": {
        "token.actions.githubusercontent.com:sub": "repo:GITHUB_ORG/REPO:ref:refs/heads/main"
      }
    }
  }]
}
```

Attach this inline policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:DeleteObject", "s3:ListBucket"],
      "Resource": [
        "arn:aws:s3:::YOUR_BUCKET_NAME",
        "arn:aws:s3:::YOUR_BUCKET_NAME/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": "cloudfront:CreateInvalidation",
      "Resource": "arn:aws:cloudfront::ACCOUNT_ID:distribution/DISTRIBUTION_ID"
    }
  ]
}
```
