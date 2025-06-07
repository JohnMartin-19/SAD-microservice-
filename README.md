# M-FARM
A web application that will provide access to e-markets from farmers across the country. Using AWS to deploy the microservice application,I have leveraged several technologies as well. Using Terraform to procure Cloud Infra for the app, and running Kubernetes clusters using manifests.Github actions for CI/CD pipeline to automate deployment to AWS

# Key Architectural Patterns
Microservices: Independent services (user-service, product-service,payment-service) with separate codebases and databases.
API-First Design: REST APIs with DRF, documented via OpenAPI (Swagger/ReDoc).
Token-Based Authentication: JWTs managed by rest_framework_simplejwt and validated via Redis.
Eventual Consistency: Redis ensures fast token validation across services, but databases may be eventually consistent.
Containerization and Orchestration: Docker and Kubernetes (EKS) for deployment and scaling.
Externalized Configuration: Environment variables in .env files (e.g., REDIS_URL, JWT_SECRET_KEY).