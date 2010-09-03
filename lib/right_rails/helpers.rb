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
    
    #
    # Returns the rightjs-modules registry for the context
    #
    def modules_registry_for(context)
      context.instance_eval do
        return @___rightjs_modules_registry ||= []
      end
    end
    
    #
    # Collects the RightJS unit options out of the given list of options
    #
    # NOTE: will nuke matching keys out of the original options object
    #
    # @param user's options
    # @param allowed unit options keys
    #
    def unit_options(options, unit_keys)
      unit_options = []

      options.dup.each do |key, value|
        c_key = key.to_s.camelize.gsub!(/^[A-Z]/){ |m| m.downcase }

        if unit_keys.include?(c_key)
          value = options.delete key

          value = case value.class.name.to_sym
            when :NilClass then 'null'
            when :Symbol   then c_key == 'method' ? "'#{value}'" : "#{value}"
            when :String   then "'#{value}'"
            else                value.inspect
          end

          unit_options << "#{c_key}:#{value}"
        end
      end

      "{#{unit_options.sort.join(',')}}"
    end
    
    #
    # Builds a RightJS based Xhr request call
    #
    def build_xhr_request(options)
      xhr = options[:submit] ?
        "new #{RightRails::Helpers.prefix}Xhr(" :
        "#{RightRails::Helpers.prefix}Xhr.load("
      
      xhr << "'#{options[:url]}'"
      
      # building the options
      xhr_options = { :onSuccess => '',  :onFailure => '', :onComplete => '' }

      # grabbing the standard XHR options
      options.each do |key, value|
        if XHR_OPTION_KEYS.include?(key.to_s)
          xhr_options[key] = case value.class.name.to_sym
            when :NilClass then 'null'
            when :String   then "'#{value}'"
            when :Symbol   then key.to_s == 'method' ? "'#{value}'" : "#{value}"
            else           value.inspect
          end
        end
      end

      # checking the parameters options
      xhr_options[:params] = options[:with]        if options[:with]

      # checking the callbacks
      xhr_options[:onSuccess]  = "#{options[:success]};"  if options[:success]
      xhr_options[:onFailure]  = "#{options[:failure]};"  if options[:failure]
      xhr_options[:onComplete] = "#{options[:complete]};" if options[:complete]

      # checking the update option
      if options[:update]
        template = options[:position] ?
          "#{RightRails::Helpers.prefix}$('%s').insert(this.text,'%s')" :
          "#{RightRails::Helpers.prefix}$('%s').update(this.text)%s"

        if options[:update].is_a?(Hash)
          xhr_options[:onSuccess]  << template % [options[:update][:success], options[:position]] if options[:update][:success]
          xhr_options[:onFailure]  << template % [options[:update][:failure], options[:position]] if options[:update][:failure]
        else
          xhr_options[:onComplete] << template % [options[:update], options[:position]]
        end
      end

      # converting the callbacks
      [:onSuccess, :onFailure, :onComplete].each do |key|
        if xhr_options[key] == '' then xhr_options.delete key
        else xhr_options[key] = "function(request){#{xhr_options[key]}}"
        end
      end

      # ebbedding the xhr options
      pairs = xhr_options.collect do |key, value|
        if value == '' then nil
        else
          "#{key}:#{value}"
        end
      end.compact.sort

      xhr << ",{#{pairs.join(',')}}" unless pairs.empty?

      xhr << ')'

      # forms sending adjustements
      xhr << ".send(#{options[:submit]})" if options[:submit]
      xhr.gsub! /^.+?(,|(\)))/, RightRails::Helpers.prefix + '$(this).send(\2'  if options[:form]

      xhr
    end
    
    XHR_OPTION_KEYS = %w{
      method
      encoding
      async
      evalScripts
      evalResponse
      evalJSON
      secureJSON
      urlEncoded
      spinner
      spinnerFx
      params
    }
    
  end
  
end