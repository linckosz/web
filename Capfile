# Override the path before running the setup
set :deploy_config_path, 'deployment/deploy.rb'
set :stage_config_path, 'deployment/stages/'
# Load DSL and Setup Up Stages
require 'capistrano/setup'
# Includes default deployment tasks
require 'capistrano/deploy'
# Override the default path to bundle deployments scripts and tasks
Dir.glob('deployment/tasks/*.cap').each { |r| import r }
