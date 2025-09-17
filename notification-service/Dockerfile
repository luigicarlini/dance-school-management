FROM node:18-slim

RUN apt-get update \
  && apt-get install -y curl libssl3 \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

ENV PRISMA_CLI_BINARY_TARGETS=debian-openssl-3.0.x

RUN npx prisma generate

EXPOSE 3005

CMD ["node", "src/server.js"]