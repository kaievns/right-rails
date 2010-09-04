# Include hook code here

require 'right_rails'

if defined?(Rails)
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
