resource "aws_elasticache_cluster" "redis" {
    cluster_id = "${var.project_name}-redis"
    engine = "redis"
    node_type = "cache.t4g.micro"
    num_cache_nodes = 1
    parameter_group_name = "default.redis7"
    port = 6379
    subnet_group_name = aws_elasticache_subnet_group.main.name
    security_group_ids = [aws_security_group.redis.id]
    tags = { Name = "${var.project_name}-redis" }
}

resource "aws_elasticache_subnet_group" "main" {
    name = "${var.project_name}-redis-subnet-group"
    subnet_ids = var.subnet_ids
    tags = { Name = "${var.project_name}-redis-subnet-group" }
}

resource "aws_security_group" "redis" {
    vpc_id = var.vpc_id
    name = "${var.project_name}-redis-sg"
    ingress {
        from_port = 6379
        to_port = 6379
        protocol = "tcp"
        cidr_blocks = ["10.0.0.0/16"]
        }
    egress {
        from_port = 0
        to_port = 0
        protocol = "-1"
        cidr_blocks = ["0.0.0.0/0"]
        }
    tags = { Name = "${var.project_name}-redis-sg" }
}

output "redis_endpoint" {
    value = aws_elasticache_cluster.redis.cache_nodes[0].address
}