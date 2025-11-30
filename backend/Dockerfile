FROM node:20-slim

WORKDIR /app

COPY package.json .
RUN npm install

COPY server.js .
COPY ../index.js ./index.js

EXPOSE 3001

CMD ["npm", "start"]
