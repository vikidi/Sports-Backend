FROM node:20

WORKDIR /home/app
COPY ./package*.json ./

RUN npm cache clear --force
RUN npm install

COPY ./ ./