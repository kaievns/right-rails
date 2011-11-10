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
      options = others.last.is_a?(Hash) ? others.pop : nil

      rightjs_require_module *others

      scripts = RightRails::Helpers.required_js_files(self)
      scripts << 'application'
      scripts << options unless options.nil?

      super *scripts
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
  # Getting back Rails 3.0 kind of method that supports blocks
  #
  def button_to_function(name, *args, &block)
    html_options = args.extract_options!.symbolize_keys

    function = block_given? ? update_page(&block) : args[0] || ''
    onclick = "#{"#{html_options[:onclick]}; " if html_options[:onclick]}#{function};"

    tag(:input, html_options.merge(:type => 'button', :value => name, :onclick => onclick))
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
  def draggable_element_js(element_id, options)
    rightjs_require_module 'dnd'
    %(new Draggable(#{ActiveSupport::JSON.encode(element_id)}, #{options_for_javascript(options)});)
  end

  #
  # replace the droppables generator to be used with RightJS
  #
  def drop_receiving_element_js(element_id, options={})
    rightjs_require_module 'dnd'

    options[:with]     ||= "'id=' + encodeURIComponent(draggable.element.id)"
    options[:onDrop]   ||= "function(draggable){" + remote_function(options) + "}"
    options.delete_if { |key, value| AJAX_OPTIONS.include?(key) }

    options[:accept] = array_or_string_for_javascript(options[:accept]) if options[:accept]
    options[:hoverclass] = "'#{options[:hoverclass]}'" if options[:hoverclass]

    # Confirmation happens during the onDrop callback, so it can be removed from the options
    options.delete(:confirm) if options[:confirm]

    %(new Droppable(#{ActiveSupport::JSON.encode(element_id)}, #{options_for_javascript(options)});)
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

# ScriptaculousHelper substitute

  CALLBACKS = Set.new([ :create, :uninitialized, :loading, :loaded, :interactive, :complete, :failure, :success ] + (100..599).to_a)
  AJAX_OPTIONS = Set.new([ :before, :after, :condition, :url, :asynchronous, :method, :insertion, :position, :form, :with, :update, :script, :type ]).merge(CALLBACKS)

  def array_or_string_for_javascript(option)
    if option.kind_of?(Array)
      "['#{option.join('\',\'')}']"
    elsif !option.nil?
      "'#{option}'"
    end
  end

  def draggable_element(element_id, options = {})
    javascript_tag(draggable_element_js(element_id, options).chop!)
  end

  def drop_receiving_element(element_id, options = {})
    javascript_tag(drop_receiving_element_js(element_id, options).chop!)
  end

  def sortable_element(element_id, options = {})
    javascript_tag(sortable_element_js(element_id, options).chop!)
  end
end
