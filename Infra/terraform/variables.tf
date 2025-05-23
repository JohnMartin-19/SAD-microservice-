variable  "aws_region"{
    default = "us-east-1"
}

variable "project_name" {
  description = "Project name for resource naming"
  type        = string
  default     = "m-farm"
}

variable "vpc_cidr"{
    default = "10.0.0.0/16"
}

variable "db_user_username"{
    sensitive = true
}

variable "db_user_password"{
    sensitive = true
}

variable "db_product_username"{
    sensitive = true
}

variable "db_product_password"{
    sensitive = true
}

variable "db_payment_username"{
    sensitive = true
}

variable "db_payment_password"{
    sensitive=true
}