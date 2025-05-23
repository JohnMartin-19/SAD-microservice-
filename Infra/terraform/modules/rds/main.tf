resource "aws_db_instance" "main" {
    identifier = var.project_name
    engine = "postgres"
    engine_version = "16.3"
    instance_class = "db.t4g.micro"
    allocated_storage = 20
    db_name = var.db_name
    username = var.db_username
    password = var.db_password
    vpc_security_group_ids = [aws_security_group.rds.id]
    db_subnet_group_name = aws_db_subnet_group.main.name
    skip_final_snapshot = true
    tags = { Name = "${var.project_name}-rds" }
}

resource "aws_db_subnet_group" "main" {
    name = "${var.project_name}-subnet-group"
    subnet_ids = var.subnet_ids
    tags = { Name = "${var.project_name}-subnet-group" }
}

resource "aws_security_group" "rds" {
    vpc_id = var.vpc_id
    name = "${var.project_name}-rds-sg"
    ingress {
        from_port = 5432
        to_port = 5432
        protocol = "tcp"
        cidr_blocks = ["10.0.0.0/16"]
        }
    egress {
        from_port = 0
        to_port = 0
        protocol = "-1"
        cidr_blocks = ["0.0.0.0/0"]
        }
    tags = { Name = "${var.project_name}-rds-sg" }
}

output "rds_endpoint" {
    value = aws_db_instance.main.endpoint
}