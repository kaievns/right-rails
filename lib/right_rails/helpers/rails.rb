#
# This module contains the ruby-on-rails native (Prototype) helper replacements
#
module RightRails::Helpers::Rails

  #
  # Overloading the rails method so it loaded
  # RightJS by default
  #
  def javascript_include_tag(first, *others)
    if (first == :defaults)
      rightjs_scripts *others
    else
      super first, *others
    end
  end
  
  #
  # Overloading the `remote_function` helper so it used the RightJS semantics
  #
  def remote_function(options)
    # assigning the url address
    url = options[:url]
    url = url.merge(:escape => false) if url.is_a?(Hash)
    options[:url] = escape_javascript(url_for(url))
    
    cmd = RightRails::Helpers.build_xhr_request(options)
    
    cmd =  "#{options[:before]};#{cmd}" if options[:before]
    cmd << ";#{options[:after]}"        if options[:after]
    
    cmd = "if(#{options[:condition]}){#{cmd}}" if options[:condition]
    cmd = "if(confirm('#{escape_javascript(options[:confirm])}')){#{cmd}}" if options[:confirm]
    
    cmd
  end
  
  #
  # Overloading the `submit_to_remote` so it used RightJS instead
  #
  def submit_to_remote(name, value, options = {})
    options[:submit] ||= "#{RightRails::Helpers.prefix}$(this.form)"

    html_options = options.delete(:html) || {}
    html_options[:name] = name

    button_to_remote(value, options, html_options)
  end
  
  #
  # Replacing `periodically_call_remote` method
  #
  def periodically_call_remote(options={})
    frequency = options[:frequency] || 10 # every ten seconds by default
    code = "function(){#{remote_function(options)}}.periodical(#{frequency * 1000})"
    javascript_tag(code)
  end
  
  #
  # replacing the draggables generator to make our autoscripts stuff working
  #
  def draggable_element_js(*args)
    rightjs_require_module 'dnd'
    
    super *args
  end
  
  #
  # replace the droppables generator to be used with RightJS
  #
  def drop_receiving_element_js(*args)
    rightjs_require_module 'dnd'
    
    super(*args).gsub!('Droppables.add', 'new Droppable'
      ).gsub!('element.id', 'draggable.element.id'
      ).gsub!('(element)', '(draggable)')
  end
  
  #
  # catching the sortables generator
  #
  def sortable_element_js(id, options={})
    rightjs_require_module 'dnd', 'sortable'
    
    script = "new Sortable('#{id}'"
    
    # processing the options
    options[:url] = escape_javascript(url_for(options[:url])) if options[:url]
    s_options = RightRails::Helpers.unit_options(options, 'sortable')
    script << ",#{s_options}" unless s_options == '{}'
    
    script << ")"
  end
  
end
