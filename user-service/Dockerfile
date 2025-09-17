FROM node:18-slim

# Installa dipendenze richieste (OpenSSL3 + curl)
RUN apt-get update \
  && apt-get install -y curl libssl3 \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

# Copia file lock per build deterministica
COPY package*.json ./

RUN npm ci --omit=dev

COPY . .

# Forza Prisma a usare binario compatibile con Debian + OpenSSL3
ENV PRISMA_CLI_BINARY_TARGETS=debian-openssl-3.0.x

RUN npx prisma generate || true

EXPOSE 3001

CMD ["node", "src/server.js"]