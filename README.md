# CyberDoc

## GIT

Pour initialiser son répertoire : 
```
git init
git remote add origin https://github.com/fjourdren/CyberDoc.git
```

Ensuite pull le code : 
```
git pull origin master
```

Pour push du code :
```
# tout ajouter
git add .

# ajouter un répertoire ciblé
git add ./branch/file

git commit -m "mon message de commit permettant de contextualiser le commit"

# ici on choisit la branche ou on push le code
# master : 
git push origin master
# branch :
git push origin branch
```

## Frontend

Installation de angular :
```
maeg@maeg-HP-ProBook-650-G1:~/Documents/PRJ_GEN_LOGI$ mkdir frontend
maeg@maeg-HP-ProBook-650-G1:~/Documents/PRJ_GEN_LOGI$ cd frontend/
maeg@maeg-HP-ProBook-650-G1:~/Documents/PRJ_GEN_LOGI$ sudo apt install npm
maeg@maeg-HP-ProBook-650-G1:~/Documents/PRJ_GEN_LOGI$ npm update

maeg@maeg-HP-ProBook-650-G1:~/Documents/PRJ_GEN_LOGI$ sudo apt-get install --only-upgrade nodejs

wget -qO- https://deb.nodesource.com/setup_12.x | sudo -E bash -
maeg@maeg-HP-ProBook-650-G1:~/Documents/PRJ_GEN_LOGI$ sudo apt-get install -y nodejs

maeg@maeg-HP-ProBook-650-G1:~/Documents/PRJ_GEN_LOGI/frontend$ sudo npm install -g @angular/cli
```

Au besoin, utiliser nvm :

```
maeg@maeg-HP-ProBook-650-G1:~$ node --version
v12.18.3
```

```
maeg@maeg-HP-ProBook-650-G1:~$ npm  --version
6.14.6
```



## Backend 

Node Js ? 

```
Installation
```

## DevOps

Jenkins ? => build automatisé en 1 click
```
Installation
```

### Tests

Si besoin : angular e2e test

Pour le back : Jest

### Déploiement

Jenkins + ansible