# Use the official Node image
FROM node:20-alpine

# Set the working folder inside the container
WORKDIR /app

# Copy package files first and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the project (index.html, src folder, etc.)
COPY . .

# Vite runs on port 5173
EXPOSE 5173

# --host lets you open the site from outside the container
CMD ["npm", "run", "dev", "--", "--host"]
