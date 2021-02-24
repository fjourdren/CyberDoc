FROM node:14.15.3

# disable linux interactive requests
ENV DEBIAN_FRONTEND=noninteractive

RUN mkdir /usr/src/frontend
WORKDIR /usr/src/frontend

RUN npm install -g @angular/cli@10.2.1
COPY package.json package.json
COPY package-lock.json package-lock.json
RUN npm install

COPY . .
