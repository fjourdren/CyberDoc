# chmod 777 exec.sh
# sudo docker pull teracy/angular-cli

echo "INSTALLING  @angular-devkit/build-angular"
npm install
echo "MOVING TO  /opt/frontend"
cd /opt/frontend
echo "BUILDING APP FROM " PWD
ng build