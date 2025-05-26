resource "aws_ecr_repository" "repo" {
    for_each = toset(var.repositories)
    name = "${var.project_name}-${each.value}"
    image_tag_mutability = "MUTABLE"
    image_scanning_configuration {
    scan_on_push = true
    }
    tags = { Name = "${var.project_name}-${each.value}-ecr" }
}

output "repository_urls" {
    value = { for repo in aws_ecr_repository.repo : repo.name => repo.repository_url }
}