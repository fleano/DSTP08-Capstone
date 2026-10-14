FROM node:22

WORKDIR /app

COPY package*.json ./

RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

RUN npm install --build-from-source

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
