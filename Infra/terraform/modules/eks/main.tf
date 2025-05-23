resource "aws_eks_cluster" "main" {
    name = "${var.project_name}-cluster"
    role_arn = aws_iam_role.eks.arn
    vpc_config {
        subnet_ids = var.subnet_ids
        endpoint_public_access = true
        }
    tags = { Name = "${var.project_name}-cluster" }
}

resource "aws_eks_node_group" "main" {
    cluster_name = aws_eks_cluster.main.name
    node_group_name = "${var.project_name}-nodes"
    node_role_arn = aws_iam_role.eks_nodes.arn
    subnet_ids = var.subnet_ids
    scaling_config {
        desired_size = 2
        max_size = 4
        min_size = 1
        }
    instance_types = ["t3.medium"]
    tags = { Name = "${var.project_name}-nodes" }
}

resource "aws_iam_role" "eks" {
    name = "${var.project_name}-eks-role"
    assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
        Effect = "Allow"
        Principal = { Service = "eks.amazonaws.com" }
        Action = "sts:AssumeRole"
        }]
    })
}

resource "aws_iam_role_policy_attachment" "eks_cluster" {
    role = aws_iam_role.eks.name
    policy_arn = "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"
}

resource "aws_iam_role" "eks_nodes" {
    name = "${var.project_name}-eks-nodes-role"
    assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
        Effect = "Allow"
        Principal = { Service = "ec2.amazonaws.com" }
        Action = "sts:AssumeRole"
        }]
    })
}

resource "aws_iam_role_policy_attachment" "eks_worker" {
    role = aws_iam_role.eks_nodes.name
    policy_arn = "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy"
}

resource "aws_iam_role_policy_attachment" "eks_cni" {
    role = aws_iam_role.eks_nodes.name
    policy_arn = "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy"
}

resource "aws_iam_role_policy_attachment" "ecr_read" {
    role = aws_iam_role.eks_nodes.name
    policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
}

output "cluster_name" {
    value = aws_eks_cluster.main.name
}