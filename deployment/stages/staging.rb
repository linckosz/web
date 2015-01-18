set :repo_url, 'ssh://deploy@192.168.137.180:2243/var/www/lincko/git/slim.web'
set :deploy_to, '/var/www/lincko/slim.web'
role :web, %w{deploy@192.168.137.180}
