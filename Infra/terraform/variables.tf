variable  "aws_region"{
    default = "us-east-1"
}

variable "project_name"{
<<<<<<< HEAD
    default  =  "m-farm"
=======
    default  =  "M-FARM"
>>>>>>> 3c341fdfe0d1e13c263e7f5a2d3d601a59494c7e
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