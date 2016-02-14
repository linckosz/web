#!/bin/bash

ssh-add /root/.ssh/id_rsa
ssh-add -l
#git rm -r --cached .
git add .
git commit -a -m "Web revision: $(date +'%s')"
git push $1 master
#cap $1 deploy --trace
