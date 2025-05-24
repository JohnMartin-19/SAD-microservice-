resource "aws_iam_user_policy" "cli_user_policy" {
  user = "cli-user"
  name = "CliUserPolicy"
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "iam:CreateOpenIDConnectProvider",
          "iam:ListOpenIDConnectProviders",
          "iam:GetOpenIDConnectProvider",
          "iam:UpdateOpenIDConnectProviderThumbprint",
          "iam:DeleteOpenIDConnectProvider",
          "eks:*",
          "ecr:*"
        ]
        Resource = "*"
      }
    ]
  })
}