backendDir="/home/centos/workspace/cyberdoc/devops/docker_backend"
backend="/home/centos/workspace/cyberdoc/backend"
frontendDir="/home/centos/workspace/cyberdoc/devops/docker_frontend"
frontendDist="/home/centos/workspace/cyberdoc/frontend/dist/cyberdoc"

etherpad="/home/centos/workspace/cyberdoc/cyberdoc-etherpad"
etherpadDir="/home/centos/workspace/cyberdoc/devops/docker_etherpad"

#docsDir="/home/centos/workspace/cyberdoc/docs"
#redocDir="/home/centos/workspace/cyberdoc/devops/docker_redoc"
#swaggerDir="/home/centos/workspace/cyberdoc/devops/docker_swagger"

pwd

sudo docker ps 

memAvailable=$( cat /proc/meminfo | grep MemAvailable | grep -Eo [0-9]+ )

if [ $memAvailable -lt 1500000 ] #1500000
then
  false
fi

sudo chmod 777 $frontendDir/exec.sh
sudo chmod 777 $backendDir/exec.sh

## frontend
sudo docker stop frontend || true && sudo docker rm frontend || true
sudo docker run --rm  -v /home/centos/workspace/cyberdoc:/opt  -w /opt/frontend  teracy/angular-cli /opt/devops/docker_frontend/exec.sh
sudo docker run -d --restart always --name frontend -v $frontendDist:/usr/share/nginx/html:ro -v $frontendDir/default.conf:/etc/nginx/conf.d/default.conf --label-file $frontendDir/labels nginx

## Etherpad
cd /home/centos/workspace/cyberdoc/cyberdoc-etherpad
sudo docker build --tag etherpad --build-arg ETHERPAD_PLUGINS=ep_comments_page --file $etherpad/Dockerfile .
cd /home/centos/workspace

### credential
echo "" > $etherpadDir/APIKEY.txt

sudo docker stop etherpad || true && sudo docker rm etherpad || true

sudo docker run -d 												                    \
    --label-file $etherpadDir/labels 							            \
    --name etherpad         									                \
    -v $etherpadDir/APIKEY.txt:/opt/etherpad-lite/APIKEY.txt	\
    -e TITLE=CyberDoc											                    \
	  -e DB_URL=													                      \
	  -e DB_NAME=													                      \
	  -e DB_ETHERPAD_COLLNAME=EtherpadData						          \
	  -e DB_FILE_COLLNAME= 										                  \
	  -e DB_USER_COLLNAME=										                  \
	  -e JWT_SECRET=												                    \
    etherpad

## backend
cd $backend
sudo docker stop backend || true && sudo docker rm backend || true
sudo docker build --file $backendDir/dockerfile --tag backend .

### env.prod with credentials here
sudo cat /dev/null > $backend/.env

sudo cp $backend/.env $backend/dist/.env 
sudo cat $backend/dist/.env

sudo docker run -d --restart always --name backend -v $backend:/app -v $backendDir:/devops --label-file $backendDir/labels backend /devops/exec.sh
 
## redoc

#sudo docker stop redoc || true && sudo docker rm redoc || true
#sudo cp $docsDir/swagger/swagger.yml $redocDir/swagger.yml
#sudo docker build --file $redocDir/dockerfile --tag redoc $redocDir
#sudo docker run -d --restart always --name redoc --label-file $redocDir/labels redoc

## swagger

#sudo docker stop swagger || true && sudo docker rm swagger || true
#sudo docker run -d --restart always --name swagger -e SWAGGER_JSON=/foo/swagger.yml -v $docsDir/swagger:/foo --label-file $swaggerDir/labels swaggerapi/swagger-ui

