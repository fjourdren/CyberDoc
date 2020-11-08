# Deploy or patch the VPN

## less than 30 seconds to explain our architecture

We have chosen to make our work visible to you. To do this we have rented a server at OVH and a domain name: fulgen.fr.
On the server, we opted for a multiservice solution using docker. Each docker contains one service from our project. The services accessible through the web are hidden behind a reverse proxy that redirects each web request. To facilitate development, we have installed different tools to monitor development and automate actions.

## What are the services ?

### Jenkins

It is a solution to automate script on an application. We use it to automate testing and deployment of the project.

### Sonarqube

This tools makes us able to scout the code of the application. It shows if some credentials string are used, can expose bugs and code duplication. After all, he produces interesting charts about the application.

### Traefik

Traefik is a reverse-proxy solution. If you can join Cyberdoc website by http://cyberdoc.fulgen.fr/, it is because the full qualified domain name is written in the DNS and because Traefik make a bind between the FQDN and the NGINX service running behind in a docker.

### MongoDB

It is a no-SQL database solution. It stocks your data.

### Frontend
The frontend is the view of the application. It is why you see on http://cyberdoc.fulgen.fr/. He runs in a web server solution call NGINX.

### Backend

This service will run the brain of your application. The backend will answer the frontend calls and make connections with other services.

### Swagger and Redoc

They are tools to layout an openAPI documentation, our developing team really wanted to have this two  layout solution because each has their pros.

### Portainer

It is a frontend for docker. This service lets you manipulate your docker with a web user interface. You have the access to the console and the log, you can also deploy a docker-compose stack. Even a non docker aware user can manipulate docker with this user interface.

## Demo VPS details 

We are using a VPS rented by OVH with the **Centos8** system. If you use another distribution, be aware that it can happen issues in the deployment of packages and services.

_Machine configuration :_
```
[centos@vps-da0f66e4 devops]$ hostnamectl
   Static hostname: vps-da0f66e4.vps.ovh.net.novalocal
         Icon name: computer-vm
           Chassis: vm
        Machine ID: d6e8c04322ba4fafa21bc3745ee5f5e0
           Boot ID: 0a8e68ed29c74827b88e57c5d36b5bcf
    Virtualization: kvm
  Operating System: CentOS Linux 8 (Core)
       CPE OS Name: cpe:/o:centos:centos:8
            Kernel: Linux 4.18.0-193.14.2.el8_2.x86_64
      Architecture: x86-64
```

_System configuration :_
```
[centos@vps-da0f66e4 devops]$ cat /etc/os-release
NAME="CentOS Linux"
VERSION="8 (Core)"
ID="centos"
ID_LIKE="rhel fedora"
VERSION_ID="8"
PLATFORM_ID="platform:el8"
PRETTY_NAME="CentOS Linux 8 (Core)"
ANSI_COLOR="0;31"
CPE_NAME="cpe:/o:centos:centos:8"
HOME_URL="https://www.centos.org/"
BUG_REPORT_URL="https://bugs.centos.org/"

CENTOS_MANTISBT_PROJECT="CentOS-8"
CENTOS_MANTISBT_PROJECT_VERSION="8"
REDHAT_SUPPORT_PRODUCT="centos"
REDHAT_SUPPORT_PRODUCT_VERSION="8"
```

_Kernel version :_
```
[centos@vps-da0f66e4 devops]$ uname -r
4.18.0-193.14.2.el8_2.x86_64
```
## Explication of folders and files

What is : 
- a dockerfile ? It is a file which has a procedure to build an image from scratch or from another image
- the labels file ? This file makes available Traefik configuration for docker, docker option to configure labels are --labels.
- the exec file ? It is a script which will be played on a docker, you will not have to modify it.

**docker_backend** : 
- dockerfile
- exec.sh
- labels

**docker_frontend**
- nginx.conf
  - standard NGINX configuration
- default.conf
  - NGINX server configuration to run properly an angular SPA website
- exec.sh
- labels

**docker_redoc**
- dockerfile
- labels

**docker_swagger**
- labels

**jenkins_build**
- jenkins_build
  - it is the script which will be playing in a build, you need to copy past this script with good credentials in the Jenkins build area

**maintenance_website**
- this folder is used to host the frontpage while you are making a maintenance

**playbook**
- deploy_docker
  - it is the first playbook you will have to play, he will install docker
- deploy_firewall
  - this playbook will update your firewall
- deploy_service
  - this will create directories and files for containers and play the docker-compose
- docker-compose
  - chain of instructions which will deploys containers

**playbook/assets**
- deploy_ssh_config
  - example of ssh configuration
- squid.conf
  - proxy squid configuration
- swagger.yml
  - swagger example
- traefik-void.yml
  - in this file, you will be able to add Traefik configuration while he runs

## Deploy VPN

### Configuration for the deployement

You must install the Ansible package on a private Linux machine (it can be a virtual machine in your computer). 

Ensure your Linux machine has connectivity with the VPS.
If it is not the case, ensure that ssh is enabled in the file /etc/ssh/sshd.config.
There is an example of the configuration of sshd on You can configure this file as you want as long as you have connectivity. So you can add more security around ssh connection if you want.

You must configure your Ansible hosts file (/etc/ansible/hosts) like this : 

```
[glvps]
146.59.147.11 # ENTER YOUR SERVER IP HERE
```

Please, create the public/private couple key on the VPS and share the public key to your Linux machine. 
You will have to install openssh on the VPN in order to execute these commands.
```
ssh-keygen -t rsa -C "your_passphrase"
ssh-copy-id user@fqdn # OR user@ip
```

If it doesn't work, you can follow this procedure from Oracle 
- https://docs.oracle.com/cd/E19683-01/806-4078/6jd6cjru7/index.html

Ensure that you can ssh the VPS from your Linux machine with the couple login/passphrase set up before.

Get the devops folder from git.

### Run playbooks

Firstly, deploy docker : 
```
ansible-playbook cyberdoc/devops/playbooks/deploy_docker.yml
```

Secondly, update the VPS firewall :
```
ansible-playbook cyberdoc/devops/playbooks/deploy_firewall.yml
```

At last, deploy docker services (Traefik, Jenkins, Portainer, mongodb, Sonarqube) :
```
ansible-playbook cyberdoc/devops/playbooks/deploy_services.yml
```

After running the last playbook, we recommend to not use again the first and second playbook as they respectively configure docker and the firewall. It can provoke errors with running containers.

## Configure Jenkins

Create your admin account on the landing page.

You must configure the Jenkins proxy on "manage plug-in" with your server IP and the your proxy port (here 3128).

Configure the VPS as a node.

Create the Cyberdoc project on Jenkins.

Copy all lines of the file cyberdoc/devops/jenkins_build/jenkins.sh in the build sequence of Jenkins.
Don't forget to add your credentials in the script.

## Configure Sonarqube

Starting credentials are admin/admin, we encourage you to change it with a more secure couple.

Go to administration, marketplace. Ensure that you can get the plug-in. 
If it is not the case, the problem may come from the proxy used by Sonarqube. 
You will have to modify this line of docker-compose.yml and execute deploy_services.yml as before.
```

  sonarqube:
    **** # DO NOT EDIT UPWARD
    command:
      - -Dhttp.proxyHost=146.59.147.11  # YOUR PROXY IP
      - -Dhttp.proxyPort=3128           # YOUR PROXY PORT
    **** # DO NOT EDIT BELOW

```

Install the TS plug-in

Sonarqube projects will be created after the first scan occurs. Afterward, the project will be updated each time the scanner has been used.

## Maintenance mode

If you need to make change on the infrastructure, you can use these commands to display "maintenance" on the screen of the application and services.

```
sudo docker stop startup_traefik_1
sudo docker run -p 80:8081 -p 443:8081 --name maintenance -v /home/centos/workspace/cyberdoc/devops/maintenance_website:/var/www -d philenius/nginx-maintenance-mode
```


