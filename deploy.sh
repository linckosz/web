#!/bin/bash

ssh-add /root/.ssh/id_rsa
#git rm -r --cached .
git add .
git commit -a -m "Web revision: $(date +'%s')"
git push $1 master
echo $1 deploy
cap $1 deploy --trace
