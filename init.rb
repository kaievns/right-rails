# Include hook code here

if defined?(ActionController)
  class ActionController::Base
    include RightRails::ControllerExtensions
    
    helper RightRails::Helpers::Basic,
           RightRails::Helpers::Rails,
           RightRails::Helpers::Forms,
           RightRails::Helpers::Misc
  end
end
