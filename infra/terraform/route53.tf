# Look up the existing tink9.com hosted zone — do not create a new one
data "aws_route53_zone" "root" {
  name         = var.root_domain
  private_zone = false
}

# ikpp.tink9.com → CloudFront
resource "aws_route53_record" "subdomain" {
  zone_id = data.aws_route53_zone.root.zone_id
  name    = local.fqdn
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.site.domain_name
    zone_id                = aws_cloudfront_distribution.site.hosted_zone_id
    evaluate_target_health = false
  }
}
