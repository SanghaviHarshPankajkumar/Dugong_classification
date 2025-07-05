# Frontend Dockerfile (frontend/Dockerfile)
FROM node:22-alpine

WORKDIR /app

COPY front/ /app/
RUN npm install && npm run build

# Use nginx to serve the frontend
FROM nginx:alpine
COPY --from=0 /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
