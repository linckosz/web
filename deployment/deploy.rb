# config valid only for current version of Capistrano
lock '3.3.5'
set :application, 'lincko'
set :repo_url, 'ssh://root@192.168.137.180/var/www/lincko/git/slim.web'
#ssh_options[:port] = 22
set :deploy_to, '/var/www/lincko/slim.web'
set :format, :pretty
set :pty, true
set :linked_files, fetch(:linked_files, []).push('composer.lock')
set :linked_dirs, fetch(:linked_dirs, []).push('logs', 'vendor', 'param')
set :keep_releases, 5
set :use_sudo, true

namespace :deploy do

desc 'Init application'
	task :composer do
		on roles(:web), in: :sequence, wait: 1 do
			#execute "ln -s #{shared_path}/composer.lock #{release_path}/composer.lock"
			# sudoer => give CHOWN privilege to deploy
			execute "cd #{shared_path} && chown -R apache:apache logs"
			execute "cd #{shared_path} && chown -R apache:apache public"
			#execute "cd #{release_path} && composer update"
		end
	end

	before :publishing, :composer

	after :restart, :clear_cache do
		on roles(:web), in: :groups, limit: 3, wait: 3 do
			# Do noting
		end
	end

end
