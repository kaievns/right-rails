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
    firstDay
    numberOfMonths
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
  end
  
  def self.included(base)
    ActionView::Helpers::FormBuilder.instance_eval{ include FormBuilderMethods }
    ActionView::Helpers::InstanceTag.instance_eval{ include InstanceTagMethods }
  end
  
end