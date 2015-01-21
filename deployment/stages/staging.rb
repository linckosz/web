set :root_path, "/var/www/lincko"
set :repo_url, "ssh://deploy@lincko.co:2244#{fetch(:root_path)}/git/slim.web"
set :deploy_to, "#{fetch(:root_path)}/slim.web"
role :web, %w{deploy@lincko.co}
#server 'lincko.co', user: 'deploy', roles: %w{web}, port: 2244, my_property: :my_value
