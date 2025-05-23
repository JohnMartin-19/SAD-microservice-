variable "project_name" {
    description = "Name of the project"
    type = string
}

variable "subnet_ids" {
    description = "List of subnet IDs for the EKS cluster"
    type = list(string)
}

variable "vpc_id" {
    description = "VPC ID for the EKS cluster"
    type = string
}