set :root_path, "/var/www/lincko"
set :repo_url, "ssh://deploy@lincko.com:2244#{fetch(:root_path)}/git/slim.web"
set :deploy_to, "#{fetch(:root_path)}/slim.web"
role :web, %w{deploy@lincko.com}
#server '1lincko.com', user: 'deploy', roles: %w{web}, port: 2244, my_property: :my_value
