# config valid only for current version of Capistrano
#lock '3.3.5'
set :application, 'lincko'
set :format, :pretty
set :pty, true
set :linked_files, fetch(:linked_files, []).push('composer.lock')
set :linked_dirs, fetch(:linked_dirs, []).push('logs', 'vendor', 'param')
set :keep_releases, 5

# to avoid an error message at the first launch, create the composer.lock file manually, and copy the current content
# "cd #{shared_path} && nano composer.lock"

namespace :deploy do

	desc 'Init application'
	task :composer do
		on roles(:web), in: :sequence, wait: 1 do
			# On server, do only once manually the follow commands
			# "cd #{shared_path} && chown -R apache:apache logs"
			# "cd #{shared_path} && chown -R apache:apache public"
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
