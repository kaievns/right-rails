#
# Basic RightRails feature helpers container
#
module RightRails::Helpers::Basic
  
  #
  # Automatically generates the javascript include tags
  #
  # USAGE:
  #   <%= rightjs_scripts %>
  #
  # you can also predefine the list of modules to load
  #
  #   <%= rightjs_scripts 'lightbox', 'calendar' %>
  #
  def rightjs_scripts(*modules)
    rightjs_require_module *modules
    javascript_include_tag *RightRails::Helpers.required_js_files(self)
  end
  
  #
  # The javascript generator access from the templates
  #
  # USAGE:
  #   Might be used both directly or with a block
  #
  #   <%= link_to 'Delete', '#', :onclick => rjs[@record].hide('fade') %>
  #   <%= link_to 'Delete', '#', :onclick => rjs{|page| page[@record].hide('fade') }
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
  # Replacing the prototype's javascript generator with our own javascript generator
  # so that the #link_to_function method was working properly
  #
  def update_page(&block)
    rjs(&block)
  end
  
  #
  # Requires the RightJS modules
  #
  def rightjs_require_module(*list)
    RightRails::Helpers.require_js_module self, *list
  end
  
end