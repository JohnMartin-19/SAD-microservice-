# Build stage
FROM node:18-alpine AS build
WORKDIR /app
COPY m-farm/package.json m-farm/package-lock.json ./
RUN npm install
COPY m-farm/ .
RUN npm run build

# Production stage
FROM nginx:alpine
# Copy the build output from the build stage to NGINX's HTML directory
COPY --from=build /app/build /usr/share/nginx/html
# Copy the custom NGINX configuration
COPY m-farm/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]