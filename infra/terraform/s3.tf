resource "random_id" "bucket_suffix" {
  byte_length = 4
}

resource "aws_s3_bucket" "site" {
  bucket = "${var.project_name}-site-${random_id.bucket_suffix.hex}"
  tags   = local.tags
}

resource "aws_s3_bucket_public_access_block" "site" {
  bucket = aws_s3_bucket.site.id

  block_public_acls       = true
  ignore_public_acls      = true
  block_public_policy     = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_versioning" "site" {
  bucket = aws_s3_bucket.site.id
  versioning_configuration {
    status = "Enabled"
  }
}

data "aws_iam_policy_document" "s3_oac" {
  statement {
    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.site.arn}/*"]
    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.site.arn]
    }
  }
}

resource "aws_s3_bucket_policy" "site" {
  bucket = aws_s3_bucket.site.id
  policy = data.aws_iam_policy_document.s3_oac.json

  depends_on = [aws_s3_bucket_public_access_block.site]
}

resource "aws_s3_bucket_cors_configuration" "site" {
  bucket = aws_s3_bucket.site.id

  # GET: allows EvidenceMedia on Vercel preview to fetch content.json and media files
  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET"]
    allowed_origins = ["https://*.vercel.app"]
    max_age_seconds = 3600
  }

  # PUT: allows browser to upload photos directly to S3 via pre-signed URLs
  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["PUT"]
    allowed_origins = ["https://ikpp.tink9.com", "https://*.vercel.app"]
    max_age_seconds = 3600
  }
}
