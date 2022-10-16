FROM node:lts
ARG NODE_ENV
ENV NODE_ENV $NODE_ENV
WORKDIR /usr/src/app
COPY . /usr/src/app

RUN rm -rf node_modules
RUN rm -f .env
RUN npm install

CMD [ "npm", "run", "docker" ]
