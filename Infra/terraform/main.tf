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


module "ecr" {
  source = "./modules/ecr"
  project_name = var.project_name
  repositories = ["m-farm-frontend", "m-farm-product-service", "m-farm-user-service", "m-farm-payment-service"]
}

module "elasticache" {
  source = "./modules/elasticache"
  project_name = var.project_name
  vpc_id = module.network.vpc_id
  subnet_ids = module.network.private_subnet_ids
}