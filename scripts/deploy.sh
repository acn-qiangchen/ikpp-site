#!/usr/bin/env bash
# Local deploy script — requires AWS CLI configured with appropriate permissions
# Usage: ./scripts/deploy.sh

set -euo pipefail

# ── Config (override with env vars) ──────────────────────────────────────────
S3_BUCKET="${S3_BUCKET:-}"
CF_DISTRIBUTION="${CF_DISTRIBUTION:-}"
AWS_REGION="${AWS_REGION:-ap-northeast-1}"

if [[ -z "$S3_BUCKET" || -z "$CF_DISTRIBUTION" ]]; then
  echo "ERROR: Set S3_BUCKET and CF_DISTRIBUTION environment variables."
  echo "  export S3_BUCKET=your-bucket-name"
  echo "  export CF_DISTRIBUTION=your-distribution-id"
  exit 1
fi

echo "▶ Building..."
npm run build

echo "▶ Syncing static assets (immutable cache)..."
aws s3 sync out/ "s3://${S3_BUCKET}" \
  --region "${AWS_REGION}" \
  --delete \
  --cache-control "public, max-age=31536000, immutable" \
  --exclude "*.html" \
  --exclude "sitemap.xml" \
  --exclude "robots.txt"

echo "▶ Syncing HTML/sitemap/robots (no-cache)..."
aws s3 sync out/ "s3://${S3_BUCKET}" \
  --region "${AWS_REGION}" \
  --cache-control "no-cache" \
  --include "*.html" \
  --include "sitemap.xml" \
  --include "robots.txt"

echo "▶ Invalidating CloudFront cache..."
aws cloudfront create-invalidation \
  --distribution-id "${CF_DISTRIBUTION}" \
  --paths "/*"

echo "✓ Deploy complete."
