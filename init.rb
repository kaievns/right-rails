# Include hook code here
if defined?(Rails)
  if Rails::VERSION::MAJOR == 2
    # Rails 2.x.x initalizer
    
    if defined?(ActionController)
      class ActionController::Base
        include RightRails::ControllerExtensions
    
        helper RightRails::Helpers::Basic,
               RightRails::Helpers::Rails,
               RightRails::Helpers::Forms,
               RightRails::Helpers::Misc
      end
    end

  else
    # Rails 3 initializer
    require 'action_controller/railtie'
    
    if defined?(ActionController)
      require 'right_rails'
      require 'right_rails/controller_extensions'
      require 'right_rails/java_script_generator'
      require 'right_rails/helpers'
      require 'right_rails/helpers/basic'
      require 'right_rails/helpers/forms'
      require 'right_rails/helpers/misc'
      require 'right_rails/helpers/rails'
      
      class ActionController::Base
        include RightRails::ControllerExtensions
    
        helper RightRails::Helpers::Basic,
               RightRails::Helpers::Forms,
               RightRails::Helpers::Misc,
               RightRails::Helpers::Rails
      end
    end
  end
end
