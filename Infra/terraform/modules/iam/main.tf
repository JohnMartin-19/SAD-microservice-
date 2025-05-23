resource "aws_iam_role" "github_actions" {
    name = "${var.project_name}-github-actions"
    assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
    Effect = "Allow"
    Principal = {
        Federated = "arn:aws:iam::740857577909:oidc-provider/token.actions.githubusercontent.com"
        }
    Action = "sts:AssumeRoleWithWebIdentity"
    Condition = {
        StringEquals = {
                "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com"
                "token.actions.githubusercontent.com:sub" = "repo:JohnMartin-19/SAD-microservice-:ref:refs/heads/main"
                }
            }
        }]
    })
}

resource "aws_iam_role_policy" "github_actions" {
  role = aws_iam_role.github_actions.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ecr:GetAuthorizationToken",
          "ecr:BatchCheckLayerAvailability",
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage",
          "ecr:PutImage",
          "ecr:InitiateLayerUpload",
          "ecr:UploadLayerPart",
          "ecr:CompleteLayerUpload"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "eks:DescribeCluster",
          "eks:ListClusters",
          "eks:AccessKubernetesApi"
        ]
        Resource = "arn:aws:eks:us-east-1:740857577909:cluster/m-farm-cluster"
      }
    ]
  })
}