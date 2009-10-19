#
# Basic RightRails feature helpers container
#
module RightRails::Helpers::Basic
  
  #
  # Automatically generates the javascript include tags
  #
  def rightjs_scripts(*modules)
    scripts = ['right']
    
    # including the submodules
    rightjs_include_module *modules
    ((@_right_scripts || []) + ['rails']).each do |package|
      scripts << "right/#{package}"
    end
    
    # use the sources in the development environment
    if defined? RAILS_ENV && RAILS_ENV == 'development'
      scripts.collect!{ |name| name + '-src' }
    end
    
    # include the localization script if available
    if defined?(I18n) && defined?(RAILS_ROOT)
      locale_file = "right/i18n/#{I18n.locale.to_s.downcase}"
      scripts << locale_file if File.exists? "#{RAILS_ROOT}/public/javascripts/#{locale_file}.js"
    end
    
    javascript_include_tag *scripts
  end
  
  #
  # Notifies the scripts collection that the user needs the module
  #
  def rightjs_include_module(*list)
    @_right_scripts ||= []
    list.each do |name|
      @_right_scripts << name.to_s unless @_right_scripts.include?(name.to_s)
    end
  end
  
  #
  # The javascript generator access from the templates
  #
  def rjs(&block)
    generator = RightRails::JavaScriptGenerator.new(self)
    yield(generator) if block_given?
    generator
  end
  
  #
  # Same as the rjs method, but will wrap the generatated code
  # in a <script></script> tag
  #
  # EXAMPLE:
  #   <%= rjs_tag do |page|
  #     page.alert 'boo'
  #   end %>
  #
  def rjs_tag(&block)
    javascript_tag do
      rjs(&block)
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
  def rightjs_unit_options(options, unit_keys)
    unit_options = []
    
    options.dup.each do |key, value|
      c_key = key.to_s.camelize.gsub!(/^[A-Z]/){ |m| m.downcase }
      
      if unit_keys.include?(c_key)
        value = options.delete key
        
        value = case value.class.name.to_sym
          when :NilClass then 'null'
          when :Symbol   then "#{value}"
          when :String   then "'#{value}'"
          else                value.inspect
        end
        
        unit_options << "#{c_key}:#{value}"
      end
    end
    
    "{#{unit_options.sort.join(',')}}"
  end
end