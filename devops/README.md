# Deploy or patch the VPN

## Demo VPS details 

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
- a dockerfile ? It is file which have a procedure to build an image from scratch or from another image
- the labels file ? This file make available traefik configuration for docker, docker option to configure labels are --labels.
- the exec file ? It is a script which will be played on a docker, you will not have to modify it.

**docker_backend** : 
- dockerfile
- exec.sh
- labels

**docker_frontend**
- nginx.conf
  - standart nginx configuration
- default.conf
  - nginx server configuration to run properly an SPA angular website
- exec.sh
- labels

**docker_redoc**
- dockerfile
- labels

**docker_swagger**
- labels

**jenkins_build**
- jenkins_build
  - it is the script wich will be play in a build, you need to copy past it in the jenkins build area

**playbook**
- deploy_docker
  - it is the first playbook you will have to play, he will install docker
- deploy_firewall
  - this playbook will update your firewall
- deploy_service
  - this will create directory for containers and play the docker-compose
- docker-compose
  - chain of instruction which will deploys containers

**playbook/assets**
- deploy_ssh_config
  - example of ssh configuration
- squid.conf
  - proxy squid configuration
- swagger.yml
  - swagger example
- traefik-void.yml
  - in this file, you will be able to add traefik configuration while he runs




## Deploy VPN

### Configuration for the deployement

You must install ansible on a Linux machine (it can be a virtual machine in your computer). 

Ensure your Linux machine has connectivity with the VPS.
If not, ensure that ssh is enable in the file /etc/ssh/sshd.config.
There is an exemple of the configuration of sshd on cyberdoc/devops/playbooks/assets/deploy_sshd_config.
Be aware that you can configure this file as you want. You only need ssh connectivity.

You must configure your ansible host file (/etc/ansible/hosts) like this : 

```
[glvps]
146.59.147.11 # enter the VPS IP here
```

Please, create the couple public/private key on the VPS and share the public key to your Linux machine. 
You will have to install openssh on the VPN in order to execute these commands.
```
ssh-keygen -t rsa -C "name@example.org"
ssh-copy-id user@child1.dev
```

If it doesn't work, you can follow this procedure from Oracle 
- https://docs.oracle.com/cd/E19683-01/806-4078/6jd6cjru7/index.html

Ensure that you can ssh the VPS from your Linux machine with the couple login/passphrase setted up before.

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

At last, deploy docker services (traefik, jenkins, portainer, mongodb, sonarqube) :
```
ansible-playbook cyberdoc/devops/playbooks/deploy_services.yml
```

After running the last playbook, we recommend to not use again the first and second playbook as they respectively configure docker and the firewall. It can provoke errors with running containers.

## Configure Jenkins

Create your admin account on the landing page.

You must configure the jenkins proxy on "manage plug in" with your VPS IP and the the proxy port (here 3128).

Configure the VPS as a node.

Create the cyberdoc project on jenkins.

Copy all lines of the file cyberdoc/devops/jenkins_build/jenkins.sh in the build sequence of jenkins.
Don't forget to put credentials in the 

## Configure Sonarqube

Starting credentials are admin/admin, we encourage you to change it with a more secure couple.

Go to administration, marketplace. Ensure that you can get plug-in. 
If it not the case, the problem can come from the proxy used by sonarqube. 
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

Sonarqube projects will be created after the first scan occurs. Afterward, the project will be updated each times the scanner has been used.

