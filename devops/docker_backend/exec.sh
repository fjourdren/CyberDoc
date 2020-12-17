#!/bin/bash
# chmod 777 exec.sh
#echo "INSTALLING"
#npm install
#echo "BUILDING"
#npm run build
#echo "DELETED USELESS FILES"
#rm -rf .git
#rm -rf src/
#rm .env.example
#rm .eslintignore
#rm .eslintrc
#rm .gitignore
#rm dockerfile
#rm jest.config.js
#rm nodemon.json
#rm tsconfig.json
#echo "STARTING BACKEND"
#npm run start

pwd
ls


echo "INSTALLING"
npm install
echo "[skip] BUILDING"
# npm run build
echo "STARTING BACKEND"
npm install -g @nestjs/cli
nest start --tsc
