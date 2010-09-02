#
# There is the namespace for the helpers and some private methods
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
    if ''.respond_to?(:html_safe)
      def html_safe(string)
        string.html_safe if string
      end
    else
      def html_safe(string)
        string
      end
    end
    
    #
    # Tells the script that the user needs this module
    #
    # Generally just a private modules handling interface
    #
    def require_js_module(context, *list)
      registry = modules_registry_for(context)
      
      list.each do |name|
        unless registry.include?(name.to_s)
          registry << name.to_s
        end
      end
    end
    
    #
    # Returns a list of required JavaScript files for RightJS
    #
    def required_js_files(context)
      scripts = ['right']
      
      
      if RightRails::Config.include_scripts_automatically?
        # hooking up the 'rails' javascript module if required
        scripts << 'right/rails' if RightRails::Config.include_rails_module?
        
        # adding the modules if needed
        scripts += modules_registry_for(context).collect do |package|
          "right/#{package}"
        end
        
        # swapping to the sources in the development mode
        if RightRails::Config.swap_builds_and_sources? && RightRails::Config.dev_env?
          scripts = scripts.collect do |package|
            "#{package}-src"
          end
        end
        
        # loading up the locales if available
        if defined?(I18n)
          locale_file = "#{RightRails::Config.locales_path}/#{I18n.locale.to_s.downcase}"

          if File.exists? "#{locale_file}.js"
            scripts << locale_file.slice(RightRails::Config.public_path.size + "/javascript/".size + 1, locale_file.size) 
          end
        end
      end
      
      scripts
    end
    
  private
    
    #
    # Returns the rightjs-modules registry for the context
    #
    def modules_registry_for(context)
      context.instance_eval do
        return @___rightjs_modules_registry ||= []
      end
    end
  end
  
end