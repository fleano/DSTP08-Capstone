# Build the Vite application with Node; this stage is not included in the final image.
FROM node:20-alpine AS build

# Set the working directory for dependency installation and the Vite build.
WORKDIR /app

# Copy dependency manifests first so Docker can reuse the install layer when source files change.
COPY package*.json ./
# Install the frontend dependencies required to compile the application.
RUN npm install

# Copy the application source and Vite configuration into the build stage.
COPY . .

# Set the API base URL used by the production frontend bundle.
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

# Compile the frontend into static files for Nginx to serve.
RUN npm run build

# Use Nginx as the production web server for the compiled static files.
FROM nginx:alpine

# Route API requests through Nginx to the backend service on the Compose network.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the optimized Vite build from the Node stage into Nginx's document root.
COPY --from=build /app/dist /usr/share/nginx/html

# Tell Docker that this container listens for HTTP traffic on port 80.
EXPOSE 80

# Keep Nginx in the foreground so it remains the container's main process.
CMD ["nginx", "-g", "daemon off;"]
