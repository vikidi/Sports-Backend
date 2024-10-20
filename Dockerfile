FROM node:20-alpine

RUN mkdir -p /home/app/node_modules && chown -R node:node /home/app

WORKDIR /home/app

COPY --chown=node:node package*.json ./
COPY --chown=node:node tsconfig.json ./

USER node

COPY --chown=node:node . .

RUN npm install