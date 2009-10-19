#
# Misc view helpers for RightJS
#
module RightRails::Helpers::Misc
  #
  # the autocompletion list result
  #
  # USAGE:
  #   it might work in several ways
  #
  #   autocomplete_result(list_of_strings)
  #   autocomplete_result(list_of_strings, :highlight => 'search')
  #   autocomplete_result(list_of_strings, :highlight => 'search', :escape => false)
  #
  #   autocomplete_result(list_of_objects, method)
  #   autocomplete_result(list_of_objects, method, :highlight => 'search')
  #
  def autocomplete_result(entries, *args)
    return if entries.empty?
    
    options   = args.last.is_a?(Hash) ? args.pop : {}
    highlight = options[:highlight]
    escape    = options[:escape].nil? ? true : options[:escape]
    field     = args.first
    
    content_tag :ul, entries.collect{ |entry|
      entry = entry.send(field) if field
      content_tag :li, highlight ? highlight(entry, highlight) : escape ? h(entry) : entry
    }
  end
  
  #
  # Generates a link that whil load the refered address in a lightbox
  #
  def link_to_lightbox(name, url={}, html_options=nil, &block)
    html_options ||= {}
    html_options[:rel] = 'lightbox'
    
    link_to name, url, html_options, &block
  end
end