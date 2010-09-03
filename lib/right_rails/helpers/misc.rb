#
# Misc view helpers for RightJS
#
module RightRails::Helpers::Misc
  #
  # Just a simple flashes generator, might be replaced in the application
  #
  def flashes
    items = flash.collect{ |key, text|
      content_tag(:div, text, :class => key)
    }.sort.join("")
    
    content_tag(:div, RightRails::Helpers.html_safe(items),
      :id => :flashes, :style => (flash.empty? ? 'display: none' : nil))
  end
  
  
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
    
    
    items     = entries.collect{ |entry|
      entry = entry.send(field) if field
      text  = highlight ? highlight(entry, highlight) : escape ? h(entry) : entry
      
      content_tag :li, RightRails::Helpers.html_safe(text)
    }.join("")
    
    content_tag :ul, RightRails::Helpers.html_safe(items)
  end
  
  
  #
  # Generates a link that whil load the refered address in a lightbox
  #
  # USAGE:
  #   Same as the #link_to method, plus you might specify the :roadtrip argument
  #   to make it a link to a lightbox roadtrip
  #
  #   <%= link_to_lightbox image_tag('/image.thmb'), '/image.full', :roadtrip => true %>
  #
  def link_to_lightbox(name, url={}, html_options={}, &block)
    rightjs_require_module 'lightbox'
    
    html_options[:rel] = 'lightbox'
    html_options[:rel] << "[roadtrip]" if html_options.delete(:roadtrip)
    
    RightRails::Helpers.add_unit_options(html_options, 'lightbox')
    
    link_to name, url, html_options, &block
  end
  
  #
  # Tabs container generator
  #
  # USAGE:
  #
  #   <% tabs do %>
  #     <% tab "Tab 1", :id => :my-tab-1 do %>
  #       content for tab 1
  #     <% end -%>
  #     <% tab "Tab 2", :url => tab2_path %>
  #   <% end -%>
  #
  #  You also can use the :type option with :carousel or :harmonica value
  #  and you can pass along any standard Tabs unit options along with it
  #
  #   <% tabs :type => :carousel, :url => '/tabs/%{id}', :cache => true do %>
  #      <% tab image_tag(image1.thumb_url), :id => image1.id %>
  #      <% tab image_tag(image2.thumb_url), :id => image2.id %>
  #
  def tabs(options={}, &block)
    rightjs_require_module 'tabs'
    @__tabs = []
    yield()
    
    options.stringify_keys!
    
    tabs_type = options.delete('type')
    options['id'] = options.delete('id') || "tabs-#{rand.to_s.split('.').last}"
    
    # checking for the carousel class
    if tabs_type == :carousel
      options['class'] ||= ''
      options['class'] << (options['class'] == '' ? '' : ' ') + 'right-tabs-carousel'
    end
    
    # extracting the tab id prefix option
    tab_id_prefix = options[:idPrefix] || options['idPrefix'] || options[:id_prefix] || options['id_prefix'] || ''
    
    RightRails::Helpers.add_unit_options(options, 'tabs')
    
    # simple tabs and carousels generator
    content = if tabs_type != :harmonica
      # tabs list
      tabs_list = content_tag(:ul,
        RightRails::Helpers.html_safe(
          @__tabs.collect{ |tab|
            content_tag(:li, content_tag(:a, tab[:title],
              :href => tab[:options][:id] ? "##{tab[:options][:id]}" : tab[:options][:url]
            ))
          }.join("\n")
        )
      ) + "\n";
      
      # contents list
      bodies_list = @__tabs.collect{|tab|
        tab[:content] ? content_tag(:li, tab[:content], :id => "#{tab_id_prefix}#{tab[:options][:id]}") + "\n" : ''
      }.join("")
      
      content_tag(:ul, tabs_list + RightRails::Helpers.html_safe(bodies_list), options)
    else
    # the harmonicas generator
      content_tag(:dl,
        RightRails::Helpers.html_safe(
          @__tabs.collect{ |tab|
            content_tag(:dt, content_tag(:a, tab[:title],
              :href => tab[:options][:id] ? "##{tab[:options][:id]}" : tab[:options][:url]
            )) + "\n" +
            content_tag(:dd, tab[:content] || '', :id => tab[:options][:id] ? "#{tab_id_prefix}#{tab[:options][:id]}" : nil)
          }.join("\n")
        ), options
      )
      
    end
    
    concat(content + RightRails::Helpers.html_safe("\n") + javascript_tag("new Tabs('#{options['id']}');"))
  end
  
  def tab(title, options={}, &block)
    options[:id] = "tab-#{rand.to_s.split('.').last}" if !options[:id] && !options[:url]
    
    @__tabs << {
      :title   => title,
      :options => options,
      :content => block_given? ? capture(&block) : nil
    }
  end
  
  #
  # The resizable unit helper
  #
  # USAGE:
  #   <% resizable(:direction => 'bottom', :minHeight => '100px') do %>
  #     Some content in here
  #   <% end -%>
  #
  def resizable(options={}, &block)
    rightjs_require_module 'resizable'
    
    RightRails::Helpers.add_unit_options(options, 'resizable')
    
    options[:class] ||= ''
    options[:class] << " right-resizable#{options[:direction] ? "-#{options.delete(:direction)}" : ''}"
    options[:class].strip!
    
    concat(content_tag(:div, (
        content_tag(:div, RightRails::Helpers.html_safe(capture(&block)), :class => 'right-resizable-content') +
        content_tag(:div, '', :class => 'right-resizable-handle')
      ), options
    ))
  end
  
end