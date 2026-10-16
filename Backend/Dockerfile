# Use Node.js 22 as the runtime and build environment for the backend.
FROM node:22

# Set the directory where the backend application will live inside the image.
WORKDIR /app

# Copy dependency manifests first to allow Docker to cache dependency installation.
COPY package*.json ./

# Install native build tools required to compile the sqlite3 dependency.
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Install Node dependencies and compile native modules for this image.
RUN npm install --build-from-source

# Copy backend source files into the image after dependencies are installed.
COPY . .

# Document the port used by the Express server.
EXPOSE 3000

# Start the backend when the container launches.
CMD ["npm", "start"]
