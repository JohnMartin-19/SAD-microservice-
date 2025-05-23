variable "project_name" {
    description = "Name of the project for ECR repositories"
    type = string
}

variable "repositories" {
    description = "List of repository names for ECR"
    type = list(string)
}