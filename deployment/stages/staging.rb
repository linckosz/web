set :repo_url, 'ssh://deploy@192.168.137.180/var/www/lincko/git/slim.web'
#ssh_options[:port] = 22
set :deploy_to, '/var/www/lincko/slim.web'

role :web, %w{deploy@192.168.137.180}
server '192.168.137.180', user: 'deploy', roles: %w{web}, my_property: :my_value
