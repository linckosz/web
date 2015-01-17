# config valid only for current version of Capistrano
lock '3.3.5'

set :application, 'lincko'
set :repo_url, 'ssh://deploy@192.168.137.180/var/www/lincko/git/slim.web'

#ssh_options[:port] = 22
#ssh_options[:forward_agent] = true

# Default branch is :master
# ask :branch, proc { `git rev-parse --abbrev-ref HEAD`.chomp }.call

# Default deploy_to directory is /var/www/my_app_name
set :deploy_to, '/var/www/lincko/slim.web'

# Default value for :scm is :git
# set :scm, :git

# Default value for :format is :pretty
# set :format, :pretty

# Default value for :log_level is :debug
# set :log_level, :debug

# Default value for :pty is false
# set :pty, true

# Default value for :linked_files is []
#set :linked_files, fetch(:linked_files, []).push('param/parameter.php')

# Default value for linked_dirs is []
set :linked_dirs, fetch(:linked_dirs, []).push('logs', 'vendor', 'param')

# Default value for default_env is {}
# set :default_env, { path: "/opt/ruby/bin:$PATH" }

# Default value for keep_releases is 5
set :keep_releases, 5

namespace :deploy do

  after :restart, :clear_cache do
    on roles(:web), in: :groups, limit: 3, wait: 3 do
      # Here we can do anything such as:
      # within release_path do
      #   execute :rake, 'cache:clear'
      # end
      #execute 'composer update'
    end
  end

end
