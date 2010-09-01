require 'spec'

$LOAD_PATH << File.join(File.dirname(__FILE__), '..', 'lib')

require 'action_view'
require 'action_controller'

require 'right_rails'
require 'right_rails/config'
require 'right_rails/java_script_generator'
require 'right_rails/controller_extensions'
require 'right_rails/helpers'
require 'right_rails/helpers/basic'
require 'right_rails/helpers/rails'
require 'right_rails/helpers/forms'
require 'right_rails/helpers/misc'

module Rails
  class << self
    def env
      'development'
    end
    
    def root
      'rails-root'
    end
    
    def public_path
      "#{root}/public"
    end
  end
end