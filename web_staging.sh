#!/bin/bash
ssh-add /root/.ssh/id_rsa
git --git-dir=../slim.web/.git add .
git commit -a -m "Web revision: $(date +'%s')"
git push deployweb master
cap web_staging deploy --trace
