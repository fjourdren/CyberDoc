CyberDoc
========

Table of contents
-----------------
* [Introduction](#introduction)
* [Services plan](#services-plan)
* [Technologies](#technologies)
* [Usage](#usage)
* [Git Strategy](#git-strategy)
* [Team](#team)
* [License](#license)

Introduction
------------
CyberDoc will be a secure and personal sensitive document storage service, which makes users able to securely manage, modify, share, collaborate and sign documents.
For that purpose, it will need to be secure and have a fault-tolerant storage system. Moreover, it will be usable on all devices (smartphones/tablets/computers) and needs to have a smooth interface.

Services plan
-------------
![Services plan](arch.png?raw=true)

Technologies
----------
* [Angular 10](https://angular.io/)
* [Ansible](https://www.ansible.com/)
* [Docker](https://www.docker.com/)
* [Docker Compose](https://docs.docker.com/compose/)
* [ExpressJS](https://expressjs.com/)
* [GridFS](https://docs.mongodb.com/manual/core/gridfs/)
* [Jenkins](https://www.jenkins.io/)
* [MongoDB](https://www.mongodb.com/)
* [Mongoose](https://mongoosejs.com/)
* [NodeJS](https://nodejs.org/)
* [SonarQube](https://www.sonarqube.org/)
* [Swagger](https://swagger.io/)
* [Traefik](https://doc.traefik.io/traefik/)
* [TypeScript](https://www.typescriptlang.org/)

Usage
-----
## Front-end
* start: `ng serve`
* build: `ng build`
* Karma - Unit test: `ng test`
* lint: `ng lint`
* Protractor - E2E tests: `ng e2e`

## Back-end
* test: `jest --forceExit --coverage --verbose`
* tsc: `tsc`
* build: `tsc`
* clean: `rm -rf dist`
* dev: `nodemon`
* startdev: `APP_ENV=dev ts-node src/server.ts`
* lint: `eslint . --ext .ts`
* start: `APP_ENV=prod node dist/server.js`

## System
* Docker Compose: `docker-compose up --build`

Git Strategy
------------
In order to simplify the addition of new features, we are following a rather simplistic Git strategy :
1. Any new feature will have to be developed on a **new branch**. 
2. Once the new feature has been tested and validated by a third party, it is merged on the `master` branch.

Team
------------
| <a href="https://github.com/ndelvoye" target="_blank">**DELVOYE Nicolhas**</a> | <a href="https://github.com/cforgeard" target="_blank">**FORGEARD Clément**</a> | <a href="https://github.com/fjourdren/" target="_blank">**JOURDREN Flavien**</a> | <a href="https://github.com/galeadon" target="_blank">**LE GAL Alexis**</a> | <a href="https://maeg.fr/index" target="_blank">**MORIN--COZANNET MAEG**</a> |
| :---: |:---:| :---:| :---:| :---:|
| [![ndelvoye](https://avatars0.githubusercontent.com/u/33501606?v3&s=200)](#) | [![cforgeard](https://avatars2.githubusercontent.com/u/19496563?v3&s=200)](#) | [![fjourdren](https://avatars2.githubusercontent.com/u/22824594?v3&s=200)](https://fjourdren.com/) | [![alegal](https://avatars2.githubusercontent.com/u/51356870?v3&s=100)](#) | [![mmorin](https://avatars1.githubusercontent.com/u/37983763?v3&s=200)](https://maeg.fr) |
| Back-end developer | Front-end developer | Back-end developer & System Engineer | Front-end developer | Back-end developer & DevOps Engineer |

License
------------
* Copyright 2020-2021 © Fulgen Corporation

Use it with an Android Emulator
------------

To test the application on smartphone, you have to :
- instal an Android emulator (ex: Genymotion)
- go to `frontend\src\environments\environment.lan-broadcast.ts` and replace IP by your current local IP
- launch backend with `nodemon`
- launch frontend with `ng serve --host 0.0.0.0 --configuration lan-broadcast`
- in your emulator, navigate to `http://<LOCAL_IP>:4200`
