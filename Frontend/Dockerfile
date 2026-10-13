# Use the official Node image
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Port that VITE runs on
EXPOSE 5173

# --host lets you open the site from outside the container
CMD ["npm", "run", "dev", "--", "--host"]
