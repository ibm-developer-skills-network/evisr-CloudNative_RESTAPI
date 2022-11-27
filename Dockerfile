FROM node:alpine as base
WORKDIR ./

COPY package.json  ./

RUN npm install 

COPY . .

CMD [ "node","app.js"]