# Include hook code here

require 'right_rails'
require 'rjs_renderer'

if defined?(Rails)
  unless ::Rails.version < "3.1"
    module RightRails
      class Engine < ::Rails::Engine
      end
    end
  end

  if Rails::VERSION::MAJOR > 2
    # Rails 3 initializer
    require 'action_controller/railtie'
  end

  if defined?(ActionController)
    class ActionController::Base
      include RightRails::ControllerExtensions

      helper RightRails::Helpers::Basic,
             RightRails::Helpers::Rails,
             RightRails::Helpers::Forms,
             RightRails::Helpers::Misc
    end
  end
end
