#
# Basic RightRails feature helpers container
#
module RightRails::Helpers::Basic
  #
  # Just a simple flashes generator, might be replaced in the application
  #
  def flashes
    content_tag(:div, flash.collect{ |key, text|
      content_tag(:div, text, :class => key)
    }.sort, :id => :flashes, :style => (flash.empty? ? 'display: none' : nil))
  end
  
  #
  # Automatically generates the javascript include tags
  #
  def rightjs_scripts
    scripts = %w{
      right
      right/rails
    }
    
    # including the submodules
    (@_right_scripts || []).uniq.each do |package|
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
end