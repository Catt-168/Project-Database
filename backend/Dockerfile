FROM node:22-alpine

RUN npm install -g nodemon

WORKDIR /app

COPY package*.json .

RUN npm install

COPY . .

EXPOSE 3001

CMD [ "npm","run","devStart" ]