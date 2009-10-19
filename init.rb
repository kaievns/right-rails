# Include hook code here

class ActionController::Base
  include RightRails::ControllerExtensions
  
  helper RightRails::Helpers::Basic,
         RightRails::Helpers::Rails,
         RightRails::Helpers::Forms
end
