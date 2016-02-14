#!/bin/bash
echo ok
ssh-add /apache_ssh/id_rsa
ssh-add -l
echo ok1
#git rm -r --cached .
git add .
git commit -a -m "Web revision: $(date +'%s')"
git push $1 master
#cap $1 deploy --trace
