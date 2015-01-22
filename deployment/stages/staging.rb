set :root_path, "/glusterfs/.lincko.co"
set :repo_url, "ssh://deploy@lincko.co:2244#{fetch(:root_path)}/deploy/share/git/slim.web"
set :deploy_to, "#{fetch(:root_path)}/www/share/slim.web"
role :web, %w{deploy@lincko.co}
#server 'lincko.co', user: 'deploy', roles: %w{web}, port: 2244, my_property: :my_value
