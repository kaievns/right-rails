#
# Just a namespace for the helpers
#
module RightRails::Helpers
  
  class << self
    def prefix
      RightRails::Config.safe_mode? ? 'RightJS.' : ''
    end
  end
  
end