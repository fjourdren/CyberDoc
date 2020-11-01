backendDir="/home/centos/workspace/cyberdoc/devops/docker_backend"
backend="/home/centos/workspace/cyberdoc/backend"
frontendDir="/home/centos/workspace/cyberdoc/devops/docker_frontend"
frontendDist="/home/centos/workspace/cyberdoc/frontend/dist/cyberdoc"
onlyofficeDir="/home/centos/workspace/cyberdoc/devops/docker_onlyoffice"

docsDir="/home/centos/workspace/cyberdoc/docs"
redocDir="/home/centos/workspace/cyberdoc/devops/docker_redoc"
swaggerDir="/home/centos/workspace/cyberdoc/devops/docker_swagger"

sudo docker ps 

memAvailable=$( cat /proc/meminfo | grep MemAvailable | grep -Eo [0-9]+ )
# echo $memAvailable

if [ $memAvailable -lt 1500000 ] #1500000
then
  false
fi

## if you need to build onlyoffice
#sudo docker build --file /home/centos/workspace/cyberdoc/devops/docker_onlyoffice/dockerfile --tag onlyoffice .
#sudo docker run -d --name onlyoffice -v /home/centos/workspace/cyberdoc/onlyoffice/logs/:/var/log/onlyoffice --label-file ./labels onlyoffice

## frontend
sudo docker stop frontend || true && sudo docker rm frontend || true
sudo docker run --rm  -v /home/centos/workspace/cyberdoc:/opt  -w /opt/frontend  teracy/angular-cli /opt/devops/docker_frontend/exec.sh
#sudo docker run -rm --memory="1g" -v /home/centos/workspace/cyberdoc:/opt  -w /opt/frontend  teracy/angular-cli /opt/devops/docker_frontend/exec.sh

sudo docker run -d --restart always --name frontend -v $frontendDist:/usr/share/nginx/html:ro -v $frontendDir/default.conf:/etc/nginx/conf.d/default.conf --label-file $frontendDir/labels nginx

## backend
cd $backend
sudo docker stop backend || true && sudo docker rm backend || true
sudo docker build --file $backendDir/dockerfile --tag backend .

sudo cat /dev/null > $backend/.env.prod

sudo cat $backend/.env.prod
sudo docker run -d --restart always --name backend -v $backend:/app -v $backendDir:/devops --label-file $backendDir/labels backend /devops/exec.sh
 
## redoc

sudo docker stop redoc || true && sudo docker rm redoc || true
sudo cp $docsDir/swagger/swagger.yml $redocDir/swagger.yml
sudo docker build --file $redocDir/dockerfile --tag redoc $redocDir
sudo docker run -d --restart always --name redoc --label-file $redocDir/labels redoc

## swagger

sudo docker stop swagger || true && sudo docker rm swagger || true
sudo docker run -d --restart always --name swagger -e SWAGGER_JSON=/foo/swagger.yml -v $docsDir/swagger:/foo --label-file $swaggerDir/labels swaggerapi/swagger-ui

