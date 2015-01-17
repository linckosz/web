role :web, %w{deploy@192.168.137.180}
server '192.168.137.180', user: 'deploy', roles: %w{web}, my_property: :my_value
