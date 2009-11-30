#
# This module contains the ruby-on-rails native (Prototype) helper replacements
#
module RightRails::Helpers::Rails
  #
  # Replacing the prototype's javascript generator with our own javascript generator
  # so that the #link_to_function method was working properly
  #
  def update_page(&block)
    rjs(&block)
  end
  
  def remote_function(options)
    cmd = build_xhr_request(options)
    
    cmd =  "#{options[:before]};#{cmd}" if options[:before]
    cmd << ";#{options[:after]}"        if options[:after]
    
    cmd = "if(#{options[:condition]}){#{cmd}}" if options[:condition]
    cmd = "if(confirm('#{escape_javascript(options[:confirm])}')){#{cmd}}" if options[:confirm]
    
    cmd
  end
  
  def submit_to_remote(name, value, options = {})
    options[:submit] ||= '$(this.form)'

    html_options = options.delete(:html) || {}
    html_options[:name] = name

    button_to_remote(value, options, html_options)
  end
  
  def periodically_call_remote(options={})
    frequency = options[:frequency] || 10 # every ten seconds by default
    code = "function(){#{remote_function(options)}}.periodical(#{frequency * 1000})"
    javascript_tag(code)
  end
  
  # stubbing the draggables generator to make our autoscripts stuff working
  def draggable_element_js(*args)
    rightjs_include_module 'dnd'
    
    super *args
  end
  
  # stubbing the droppables generator
  def drop_receiving_element_js(*args)
    rightjs_include_module 'dnd'
    
    super(*args).gsub!('Droppables.add', 'new Droppable'
      ).gsub!('element.id', 'draggable.element.id'
      ).gsub!('(element)', '(draggable)')
  end
  
  # catching the sortables generator
  def sortable_element_js(id, options={})
    rightjs_include_module 'dnd', 'sortable'
    
    script = "new Sortable('#{id}'"
    
    # processing the options
    options[:url] = escape_javascript(url_for(options[:url])) if options[:url]
    s_options = rightjs_unit_options(options, SORTABLE_OPTION_KEYS)
    script << ",#{s_options}" unless s_options == '{}'
    
    script << ")"
  end
  
protected

  SORTABLE_OPTION_KEYS = %w{
    url
    direction
    tags
    method
    idParam
    posParam
    parseId
  }

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

  # builds the xhr request string
  def build_xhr_request(options)
    xhr = options[:submit] ? "new Xhr(" : "Xhr.load("
    
    # assigning the url address
    url = options[:url]
    url = url.merge(:escape => false) if url.is_a?(Hash)
    xhr << "'#{escape_javascript(url_for(url))}'"
    
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
      template = options[:position] ? "$('%s').insert(this.text,'%s')" : "$('%s').update(this.text)%s"
      
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
    xhr.gsub! /^.+?(,|(\)))/, '$(this).send(\2'  if options[:form]
    
    xhr
  end
  
end
