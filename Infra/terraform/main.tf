module "network"{
    source="./modules/network"
    vpc_cidr=var.vpc_cidr
    project_name=var.project_name
}

module "eks"{
    source = "./modules/eks"
    project_name = var.project_name
    subnet_ids = module.network.public_subnet_ids
    vpc_id = module.network.vpc_id
}

module "rds_user"{
    source = "./modules/rds"
    project_name="${var.project_name}-user"
    vpc_id = module.network.vpc_id
    subnet_ids = module.network.private_subnet_ids
    db_name = "userdb"
    db_username = var.db_user_username
    db_password = var.db_user_password
}

module "rds_product"{
    source = "./modules/rds"
    project_name="${var.project_name}-product"
    vpc_id = module.network.vpc_id
    subnet_ids = module.network.private_subnet_ids
    db_name = "productdb"
    db_username = var.db_product_username
    db_password = var.db_product_password
}

module "rds_payment"{
    source = "./modules/rds"
    project_name="${var.project_name}-payment"
    vpc_id = module.network.vpc_id
    subnet_ids = module.network.private_subnet_ids
    db_name = "paymentdb"
    db_username = var.db_payment_username
    db_password = var.db_payment_password
}


module "ecr"{
    source= "./modules/ecr"
    project_name = var.project_name
<<<<<<< HEAD
    repositories = ["frontend","main-app","user-service","payment-service"]
=======
    repositories = ["Frontend","Backend]
>>>>>>> 3c341fdfe0d1e13c263e7f5a2d3d601a59494c7e
}

module "elasticache"{
    source = "./modules/elasticache"
    project_name = var.project_name
<<<<<<< HEAD
    vpc_id = module.network.vpc_id
=======
    vpc = module.network.vpc_id
>>>>>>> 3c341fdfe0d1e13c263e7f5a2d3d601a59494c7e
    subnet_ids =module.network.private_subnet_ids

}

module "iam"{
    source = "./modules/iam"
    project_name = var.project_name
<<<<<<< HEAD
    
=======
>>>>>>> 3c341fdfe0d1e13c263e7f5a2d3d601a59494c7e
}