variable "project_name" {
    description = "Name of the project for ElastiCache"
    type = string
}

variable "vpc_id" {
    description = "VPC ID for the ElastiCache instance"
    type = string
}

variable "subnet_ids" {
    description = "List of subnet IDs for the ElastiCache instance"
    type = list(string)
}