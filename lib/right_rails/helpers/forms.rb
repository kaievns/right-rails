#
# RightJS specific form features module
#
module RightRails::Helpers::Forms
  CALENDAR_OPTION_KEYS = %w{
    format
    showTime
    twentyFourHour
    timePeriod
    showButtons
    minDate
    maxDate
    listYears
    firstDay
    numberOfMonths
    fxName
    fxDuration
    hideOnPick
  }
  
  AUTOCOMPLETER_OPTION_KEYS = %w{
    param
    method
    minLength
    threshold
    cache
    local
    fxName
    fxDuration
    spinner
  }
  
  SLIDER_OPTION_KEYS = %w{
    min
    max
    snap
    value
    direction
    update
    round
  }
  
  RATER_OPTION_KEYS = %w{
    size
    value
    update
    disabled
    disableOnVote
    url
    param
    Xhr
  }
  
  COLORPICKER_OPTION_KEYS = %w{
    format
    update
    updateBg
    fxName
    fxDuration
  }
  
  #
  # Generates the calendar field tag
  #
  # The options might contain the usual html options along with the RightJS Calendar options
  #
  def calendar_field_tag(name, value=nil, options={})
    text_field_tag name, value, __add_calendar_field_options(options)
  end
  
  #
  # The form_for level calendar field generator
  #
  def calendar_field(object_name, method, options={})
    options = __add_calendar_field_options(options)
    ActionView::Helpers::InstanceTag.new(object_name, method, self, options.delete(:object)).to_calendar_field_tag(options)
  end
  
  #
  # Autocompletion field tag
  #
  # The options should contain an url or a list of local options
  #
  def autocomplete_field_tag(name, value, options)
    text_field_tag name, value, __add_autocomplete_field_options(options)
  end
  
  #
  # The form_for level autocomplete-field generator
  #
  def autocomplete_field(object_name, method, options)
    options = __add_autocomplete_field_options(options)
    ActionView::Helpers::InstanceTag.new(object_name, method, self, options.delete(:object)).to_autocomplete_field_tag(options)
  end
  
  #
  # The slider widget generator
  #
  def slider_tag(name, value=nil, options={})
    hidden_field_tag(name, value, __add_slider_options(options)) + "\n" + __slider_generator(options.merge(:value => value), name)
  end
  
  #
  # The form_for level slider widget generator
  #
  def slider(object_name, method, options={})
    ActionView::Helpers::InstanceTag.new(object_name, method, self,
      options.delete(:object)).to_slider_tag(__add_slider_options(options)) +
      "\n" + __slider_generator(options, object_name, method)
  end
  
  #
  # The rater widget basic generator
  #
  def rater_tag(name, value, options={})
    hidden_field_tag(name, value, __add_rater_options(options)) + "\n" + __rater_generator(options.merge(:value => value), name)
  end
  
  #
  # The form level rater generator
  #
  def rater(object_name, method, options={})
    ActionView::Helpers::InstanceTag.new(object_name, method, self,
      options.delete(:object)).to_rater_tag(__add_rater_options(options)) +
      "\n" + __rater_generator(options, object_name, method)
  end
  
  #
  # Builds a dummy rater, just for displaying purposes
  #
  def rater_display(value, options={})
    rightjs_include_module 'rater'
    
    content_tag :div, RightRails::Helpers.html_safe((0...(options[:size] || 5)).to_a.collect{ |i|
      content_tag :div, RightRails::Helpers.html_safe('&#9733;'), :class => i < value ? 'right-rater-glow' : nil
    }.join('')), :class => 'right-rater right-rater-disabled'
  end
  
  #
  # a standalone colorpicker field tag
  #
  def colorpicker_field_tag(name, value, options={})
    text_field_tag name, value, __add_colorpicker_field_options(options)
  end
  
  #
  # A colorpicker field for a form
  #
  def colorpicker_field(object_name, method, options={})
    options = __add_colorpicker_field_options(options)
    ActionView::Helpers::InstanceTag.new(object_name, method, self, options.delete(:object)).to_colorpicker_field_tag(options)
  end
  
private

  def __add_calendar_field_options(options={})
    rightjs_include_module 'calendar'
    
    options['rel'] = 'calendar'
    
    calendar_options = rightjs_unit_options(options, CALENDAR_OPTION_KEYS)
    options['data-calendar-options'] = calendar_options unless calendar_options == '{}'
    
    options
  end
  
  def __add_autocomplete_field_options(options)
    rightjs_include_module 'autocompleter'
    
    options['rel'] = "autocompleter[#{escape_javascript(url_for(options.delete(:url)))}]"
    
    autocompleter_options = rightjs_unit_options(options, AUTOCOMPLETER_OPTION_KEYS)
    options['data-autocompleter-options'] = autocompleter_options unless autocompleter_options == '{}'
    options['autocomplete'] = 'off'
    
    options
  end
  
  def __add_slider_options(options)
    rightjs_include_module 'dnd', 'slider'
    options.reject { |key, value| SLIDER_OPTION_KEYS.include?(key.to_s) }
  end
  
  def __slider_generator(options, name, method=nil)
    value   = options[:value]
    value ||= ActionView::Helpers::InstanceTag.value_before_type_cast(instance_variable_get("@#{name}"), method.to_s) if method
    name    = "#{name}[#{method}]" if method
    id      = options[:id] || sanitize_to_id(name)
    options = rightjs_unit_options(options.merge(:value => value), SLIDER_OPTION_KEYS)
    javascript_tag "new Slider(#{options}).insertTo('#{id}','after').assignTo('#{id}');"
  end
  
  def __add_rater_options(options)
    rightjs_include_module 'rater'
    options.reject { |key, value| RATER_OPTION_KEYS.include?(key.to_s) }
  end
  
  def __rater_generator(options, name, method=nil)
    value   = options[:value]
    value ||= ActionView::Helpers::InstanceTag.value_before_type_cast(instance_variable_get("@#{name}"), method.to_s) if method
    name    = "#{name}[#{method}]" if method
    id      = options[:id] || sanitize_to_id(name)
    options = rightjs_unit_options(options.merge(:value => value), RATER_OPTION_KEYS)
    javascript_tag "new Rater(#{options}).insertTo('#{id}','after').assignTo('#{id}');"
  end
  
  def __add_colorpicker_field_options(options)
    rightjs_include_module 'colorpicker'
    
    options['rel'] = 'colorpicker'
    
    colorpicker_options = rightjs_unit_options(options, COLORPICKER_OPTION_KEYS)
    options['data-colorpicker-options'] = colorpicker_options unless colorpicker_options == '{}'
    
    options
  end
  
  
###################################################################################
#
# The ActiveView native form-builder extensions
#
###################################################################################
  
  module FormBuilderMethods
    def calendar_field(name, options={})
      @template.calendar_field(@object_name, name, objectify_options(options))
    end
    
    def autocomplete_field(name, options={})
      @template.autocomplete_field(@object_name, name, objectify_options(options))
    end
    
    def slider(name, options={})
      @template.slider(@object_name, name, objectify_options(options))
    end
    
    def rater(name, options={})
      @template.rater(@object_name, name, objectify_options(options))
    end
    
    def colorpicker_field(name, options={})
      @template.colorpicker_field(@object_name, name, objectify_options(options))
    end
  end
  
  module InstanceTagMethods
    def to_calendar_field_tag(options)
      options = options.stringify_keys
      
      # formatting the date/time value if the format is specified
      if !options["value"] && options["data-calendar-options"]
        format = options["data-calendar-options"].scan(/format:('|")(.+?)\1/)
        time = value_before_type_cast(object)
        if time && time.respond_to?(:to_time) && format.size == 1
          options["value"] = time.to_time.strftime(format[0][1])
        end
      end
      
      to_input_field_tag('text', options)
    end
    
    def to_autocomplete_field_tag(options)
      to_input_field_tag('text', options)
    end
    
    def to_slider_tag(options)
      to_input_field_tag('hidden', options)
    end
    
    def to_rater_tag(options)
      to_input_field_tag('hidden', options)
    end
    
    def to_colorpicker_field_tag(options)
      to_input_field_tag('text', options)
    end
  end
  
  def self.included(base)
    ActionView::Helpers::FormBuilder.instance_eval{ include FormBuilderMethods }
    ActionView::Helpers::InstanceTag.instance_eval{ include InstanceTagMethods }
  end
  
end