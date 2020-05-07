FROM node:12-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run postinstall

CMD [ "npm", "run", "start" ]
