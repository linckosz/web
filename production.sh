#!/bin/bash
ssh-add /root/.ssh/id_rsa
#git rm -r --cached .
git add .
git commit -a -m "Web revision: $(date +'%s')"
git push deployweb master
cap production deploy --trace
