#
# Basic RightRails feature helpers container
#
module RightRails::Helpers::Basic
  #
  # Just a simple flashes generator, might be replaced in the application
  #
  def flashes
    content_tag(:div, flash.collect{ |key, text|
      content_tag(:div, content_tag(:span, '', :class => :icon) + text, :class => key)
    }, :id => :flashes, :style => (flash.empty? ? 'display: none' : nil))
  end
  
  #
  # Automatically generates the javascript include tags
  #
  def rightjs_scripts
    scripts = %w{
      right
      right/rails
    }
    
    # use the sources in the development environment
    if RAILS_ENV == 'development'
      scripts.collect!{ |name| name + '-src' }
    end
    
    javascript_include_tag *scripts
  end
  
  def rjs(&block)
  end
  
  def rjs_tag(&block)
    javascript_tag do
      rjs(&block)
    end
  end
end