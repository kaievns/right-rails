# Include hook code here

class ActionController::Base
  include RightRails::ControllerExtensions
  
  helper RightRails::Helpers::Basic
end
