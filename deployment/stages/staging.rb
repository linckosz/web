role :web, %w{root@192.168.137.180}
server '192.168.137.180', user: 'root', roles: %w{web}, my_property: :my_value
