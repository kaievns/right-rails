#
# = RightRails configuration interface
#
# You can adjust the following settings with the RightRails::Config object
#
# - RightRails::Config.env                            _auto_, _production_ or _development_
# - RightRails::Config.public_path                    _auto_ or some string
# - RightRails::Config.locales_path                   _auto_ or some string
# - RightRails::Config.safe_mode                      _auto_, +true+ or +false+
# - RightRails::Config.rightjs_version                _auto_, 2 or 1
# - RightRails::Config.include_rails_module           +true+ or +false+
# - RightRails::Config.swap_builds_and_sources        +true+ or +false+
# - RightRails::Config.include_scripts_automatically  +true+ or +false+
#
# When you set a property in _auto_ then the script will try to figure the
# parameters out by the current environment and the content of the
# public/javascript/right.js file
#
module RightRails::Config
  
  DEFAULT_PUBLIC_PATH      = 'auto' #  'auto' or some path
  DEFAULT_SAFE_MODE        = 'auto' #  'auto', true or false
  DEFAULT_RIGHTJS_VERSION  = 'auto' #  'auto', 2 or 1
  DEFAULT_ENVIRONMENT      = 'auto' #  'auto', 'production' or 'development'
  DEFAULT_RIGHTJS_LOCATION = 'javascripts/right.js'
  DEFAULT_LOCALES_LOCATION = 'javascripts/right/i18n'
  DEFAULT_INCLUDE_RAILS    = true   # true or false
  DEFAULT_AUTO_INCLUDES    = true   # true or false
  DEFAULT_SWAP_BUILDS      = true   # true or false
  
  class << self
    #
    # Resetting the configuration to the defaults
    #
    def reset!
      remove_instance_variable(:@environment)     if defined?(@environment)
      remove_instance_variable(:@public_path)     if defined?(@public_path)
      remove_instance_variable(:@locales_path)    if defined?(@locales_path)
      remove_instance_variable(:@safe_mode)       if defined?(@safe_mode)
      remove_instance_variable(:@rightjs_version) if defined?(@rightjs_version)
      remove_instance_variable(:@include_rails)   if defined?(@include_rails)
      remove_instance_variable(:@auto_includes)   if defined?(@auto_includes)
      remove_instance_variable(:@swap_builds)     if defined?(@swap_builds)
    end
    
    #
    # Returns the currently used environment
    #
    # By default will use the Rails.env
    #
    def env
      unless defined?(@environment)
        self.env = DEFAULT_ENVIRONMENT
      end
      
      @environment
    end
    
    #
    # Sets the current environment, which will effectively make
    # RightRails to switch between the builds and src versions of
    # right.js and modules
    #
    # You can use 'production', 'development' or 'auto'
    #
    def env=(value)
      if value == 'auto'
        value = if in_rails?
          Rails.env
        else
          "production"
        end
      end
      
      @environment = value.to_s == 'production' ? 'production' : 'development'
    end
    
    #
    # Returns a marker if we are in the _development_ environment
    #
    def dev_env?
      env == 'development'
    end
    
    #
    # Returns the public_html directory path
    #
    # By default it will return the Rails.public_path
    #
    def public_path
      unless defined?(@public_path)
        self.public_path = DEFAULT_PUBLIC_PATH
      end
      
      @public_path
    end
    
    #
    # If you have your public_html somewhere else
    # this is the place where you can define it
    #
    def public_path=(path)
      if path == 'auto'
        path = self.public_path = if in_rails?
          Rails.public_path
        else
          # TODO other frameworks handling in here
          "public"
        end
      end
      
      # getting rid of the trailing slash
      if path.slice(path.size-1, path.size) == '/'
        path = path.slice(0, path.size-1) 
      end
      
      @public_path = path.dup
    end
    
    #
    # Returns a full-path to the localization modules directory
    #
    def locales_path
      unless defined?(@locales_path)
        self.locales_path = "#{public_path}/#{DEFAULT_LOCALES_LOCATION}"
      end
      
      @locales_path
    end
    
    #
    # Sets the RightJS localilzation modules directory path
    #
    def locales_path=(path)
      # getting rid of the trailing slash
      if path.slice(path.size-1, path.size) == '/'
        path = path.slice(0, path.size-1) 
      end
      
      @locales_path = path
    end
    
    #
    # Checks if the RightJS is used in the safe-mode
    #
    def safe_mode
      unless defined?(@safe_mode)
        self.safe_mode = DEFAULT_SAFE_MODE
      end
      
      @safe_mode
    end
    
    #
    # Setup whether RightJS is used in the safe-mode or not
    #
    # You can use boolean values or a string 'auto' (default)
    # in which case it will try to figure it out by reading the
    # `public/javascripts/right.js` file
    #
    def safe_mode=(value)
      @safe_mode = !!(value == 'auto' ? read_rightjs_file =~ /\.safe\s*=\s*true/ : value)
    end
    
    #
    # Returns the RightJS version (2 or 1)
    #
    def rightjs_version
      unless defined?(@rightjs_version)
        self.rightjs_version = DEFAULT_RIGHTJS_VERSION
      end
      
      @rightjs_version
    end
    
    #
    # With this method you can set up which version of RightJS do you use
    # 2 or 1. You also can set it to a string 'auto' (by default) in which
    # case it will try to figure it out by reading the `public/javascripts/right.js`
    # file
    #
    def rightjs_version=(value)
      if value == 'auto'
        value = read_rightjs_file =~ /version\s*(:|=)\s*("|')1/ ? 1 : 2
      end
      
      @rightjs_version = value < 2 ? 1 : 2
    end
    
    #
    # Returns a marker if the script should automatically include
    # the ruby-on-rails module for RightJS
    #
    def include_rails_module
      unless defined?(@include_rails)
        self.include_rails_module = DEFAULT_INCLUDE_RAILS
      end
      
      @include_rails
    end
    
    #
    # Sets the marker if the plugin should automatically include
    # the ruby-on-rails module for RightJS
    #
    def include_rails_module=(value)
      @include_rails = !! value
    end
    
    #
    # Checks if the plugin should automatically swap between
    # the builds and the source-versions of JavaScript files
    # depending on current environment
    #
    def swap_builds_and_sources
      unless defined?(@swap_builds)
        self.swap_builds_and_sources = DEFAULT_SWAP_BUILDS
      end
      
      @swap_builds
    end
    
    #
    # Sets the marker if the plugin should automatically
    # swap between source and builds of JavaScript files
    #
    def swap_builds_and_sources=(value)
      @swap_builds = !! value
    end
    
    #
    # Checks if the plugin should include JavaScript modules
    # automatically when they needed
    #
    def include_scripts_automatically
      unless defined?(@auto_includes)
        self.include_scripts_automatically = DEFAULT_AUTO_INCLUDES
      end
      
      @auto_includes
    end
    
    #
    # Sets the marker if the plugin should automatically include
    # all the JavaScript files on the page when they needed
    #
    def include_scripts_automatically=(value)
      @auto_includes = !! value
    end
    
    # boolean methods aliases
    alias_method :safe_mode?,                     :safe_mode
    alias_method :include_rails_module? ,         :include_rails_module
    alias_method :swap_builds_and_sources? ,      :swap_builds_and_sources
    alias_method :include_scripts_automatically?, :include_scripts_automatically
    
  private
    
    #
    # reading the `public/javascripts/right.js` file for the purposes
    # of the automatic configuration
    #
    # NOTE: _will_not_ raise any errors if the file is not found
    #
    def read_rightjs_file
      File.read("#{public_path}/#{DEFAULT_RIGHTJS_LOCATION}")
    rescue
      ''
    end
    
    #
    # Checking if we are in the Ruby-on-Rails environment
    #
    def in_rails?
      !Object.const_get(:Rails).nil?
    end
  end
end