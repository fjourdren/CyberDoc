FROM ubuntu:20.04

# disable linux interactive requests
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update

# install node & npm
RUN apt-get -y install wget
RUN wget -qO- https://deb.nodesource.com/setup_14.x | bash -
RUN apt-get -y install nodejs
RUN npm i -g npm@latest

# install libreoffice
RUN apt-get update && apt-get install -y libreoffice

# install preview dependencies (https://www.npmjs.com/package/filepreview-es6)
RUN apt-get update && apt-get install -y unoconv ffmpeg imagemagick curl

# fix pdf security rule from imagemagick
RUN sed -i 's/<\/policymap>/  <policy domain="coder" rights="read | write" pattern="PDF" \/>\
<\/policymap>/g' /etc/ImageMagick-6/policy.xml

RUN mkdir /usr/src/backend
WORKDIR /usr/src/backend
COPY package.json package.json
COPY package-lock.json package-lock.json
RUN npm install

# copy app files
COPY . .