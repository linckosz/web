#!/bin/bash
ssh-add /root/.ssh/id_rsa
git --git-dir=../slim.web/.git add .
git --git-dir=../slim.web/.git commit -a -m "Web revision: $(date +'%s')"
git --git-dir=../slim.web/.git push deployweb master
cap web_staging deploy --trace
