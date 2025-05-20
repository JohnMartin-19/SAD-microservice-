FROM node:18-apline AS build
WORKDIR /app
COPY m-farm/package.json m-farm/package-lock.json ./
RUN npm install 
COPY m-farm/ .
RUN npm run build 
FROM nginx:alpine 
COPY --from build/app/build/usr/share/nginx/html

COPY m-farm/nginx.conf/ect/nginx/cof.d/default.conf 
EXPOSE 80
CMD ["nginx","-g","daemon-off;"]