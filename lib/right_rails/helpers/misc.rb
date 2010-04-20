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
    
    content_tag(:div, items.send(''.respond_to?(:html_safe) ? :html_safe : :to_s),
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
      content_tag :li, highlight ? highlight(entry, highlight) : escape ? h(entry) : entry
    }.join("")
    
    content_tag :ul, items.send(''.respond_to?(:html_safe) ? :html_safe : :to_s)
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
    rightjs_include_module 'lightbox'
    
    html_options[:rel] = 'lightbox'
    html_options[:rel] << "[roadtrip]" if html_options.delete(:roadtrip)
    
    lightbox_options = rightjs_unit_options(html_options, LIGHTBOX_OPTION_KEYS)
    html_options['data-lightbox-options'] = lightbox_options unless lightbox_options == '{}'
    
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
    rightjs_include_module 'tabs'
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
    
    tabs_options = rightjs_unit_options(options, TABS_OPTION_KEYS)
    options['data-tabs-options'] = tabs_options unless tabs_options == '{}'
    
    # extracting the tab id prefix option
    tab_id_prefix = tabs_options.scan(/idPrefix:('|")(.+?)\1/)
    tab_id_prefix = tab_id_prefix.size == 1 ? tab_id_prefix[0][1] : ''
    
    # simple tabs and carousels generator
    content = if tabs_type != :harmonica
      # tabs list
      tabs_list = content_tag(:ul,
        @__tabs.collect{ |tab|
          content_tag(:li, content_tag(:a, tab[:title],
            :href => tab[:options][:id] ? "##{tab[:options][:id]}" : tab[:options][:url]
          ))
        }.join("\n")
      ) + "\n";
      
      # contents list
      bodies_list = @__tabs.collect{|tab|
        tab[:content] ? content_tag(:li, tab[:content], :id => "#{tab_id_prefix}#{tab[:options][:id]}") + "\n" : ''
      }.join("")
      
      content_tag(:ul, tabs_list + bodies_list.send("".respond_to?(:html_safe) ? :html_safe : :to_s), options)
    else
    # the harmonicas generator
      content_tag(:dl,
        @__tabs.collect{ |tab|
          content_tag(:dt, content_tag(:a, tab[:title],
            :href => tab[:options][:id] ? "##{tab[:options][:id]}" : tab[:options][:url]
          )) + "\n" +
          content_tag(:dd, tab[:content] || '', :id => tab[:options][:id] ? "#{tab_id_prefix}#{tab[:options][:id]}" : nil)
        }.join("\n"),
        options
      )
      
    end
    
    concat(content + "\n".send("".respond_to?(:html_safe) ? :html_safe : :to_s) + javascript_tag("new Tabs('#{options['id']}');"))
  end
  
  def tab(title, options={}, &block)
    options[:id] = "tab-#{rand.to_s.split('.').last}" if !options[:id] && !options[:url]
    
    @__tabs << {
      :title   => title,
      :options => options,
      :content => block_given? ? capture(&block) : nil
    }
  end
  
  TABS_OPTION_KEYS = %w{
    idPrefix
    tabsElement
    resizeFx
    resizeDuration
    scrollTabs
    scrollDuration
    selected
    disabled
    closable
    loop
    loopPause
    url
    cache
    Xhr
    Cookie
  }
  
  LIGHTBOX_OPTION_KEYS = %w{
    endOpacity
    fxDuration
    hideOnEsc
    hideOnOutClick
    showCloseButton
    blockContent
    mediaWidth
    mediaHeight
  }
  
end