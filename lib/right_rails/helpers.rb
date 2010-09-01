#
# Just a namespace for the helpers
#
module RightRails::Helpers
  
protected

  class << self
    #
    # Adds the `RightJS.` prefix in safe-mode
    #
    def prefix
      RightRails::Config.safe_mode? ? 'RightJS.' : ''
    end
    
    #
    # Converting the string into an html-safe eqivalent
    # regardless of the current environment
    #
    def html_safe(string)
      string if string
    end
    
    # replacing the medthod for Rails 3
    if ''.respond_to?(:html_safe)
      def html_safe(string)
        string.html_safe if string
      end
    end
  end
  
end