#!/bin/bash
ssh-add /root/.ssh/id_rsa
git add .
git commit -a -m "Web revision: $(date +'%s')"
git push deployweb master
cap staging deploy --trace
