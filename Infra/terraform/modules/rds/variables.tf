variable "project_name" {
    description = "Name of the project for RDS instance"
    type = string
}

variable "vpc_id" {
    description = "VPC ID for the RDS instance"
    type = string
}

variable "subnet_ids" {
    description = "List of subnet IDs for the RDS instance"
    type = list(string)
}

variable "db_name" {
    description = "Database name for the RDS instance"
    type = string
}

variable "db_username" {
    description = "Username for the RDS database"
    type = string
    sensitive = true
}

variable "db_password" {
    description = "Password for the RDS database"
    type = string
    sensitive = true
}