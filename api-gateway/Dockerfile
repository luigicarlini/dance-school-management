FROM node:18-alpine

# Set APP
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install deps
RUN npm install --production

# Copy source
COPY . .

EXPOSE 3000

CMD ["npm", "start"]