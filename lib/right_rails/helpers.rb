#
# There is the namespace for the helpers and some private methods
#
module RightRails::Helpers

  autoload :Basic, 'right_rails/helpers/basic'
  autoload :Rails, 'right_rails/helpers/rails'
  autoload :Forms, 'right_rails/helpers/forms'
  autoload :Misc,  'right_rails/helpers/misc'

  ##########################################################################
  #  Varios RightJS unit keys
  ##########################################################################
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

  CALENDAR_OPTION_KEYS = %w{
    format
    showTime
    showButtons
    minDate
    maxDate
    twentyFourHour
    timePeriod
    listYears
    firstDay
    numberOfMonths
    fxName
    fxDuration
    hideOnPick
    update
    trigger
  }

  AUTOCOMPLETER_OPTION_KEYS = %w{
    url
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
    html
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
    trigger
    fxName
    fxDuration
  }

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

  TAGS_OPTION_KEYS = %w{
    tags
    vertical
    allowNew
    nocase
    autocomplete
    separator
  }

  LIGHTBOX_OPTION_KEYS = %w{
    group
    endOpacity
    fxDuration
    hideOnEsc
    hideOnOutClick
    showCloseButton
    blockContent
    mediaWidth
    mediaHeight
  }

  RESIZABLE_OPTION_KEYS = %w{
    minWidth
    maxWidth
    minHeight
    maxHeight
  }

  SORTABLE_OPTION_KEYS = %w{
    url
    direction
    tags
    method
    Xhr
    idParam
    posParam
    parseId
    dragClass
    accept
    minLength
  }

protected

  class << self
    #
    # Adds the `RightJS.` prefix in safe-mode
    #
    def prefix
      RightRails::Config.safe_mode? ? 'RightJS.' : ''
    end

    #
    # Switches between the css class-names prefixes
    # depending on current RightJS version
    #
    def css_prefix
      RightRails::Config.rightjs_version < 2 ? 'right' : 'rui'
    end

    #
    # Converting the string into an html-safe eqivalent
    # regardless of the current environment
    #
    if ''.respond_to?(:html_safe)
      def html_safe(string)
        string.html_safe if string
      end
    else
      def html_safe(string)
        string
      end
    end

    #
    # Tells the script that the user needs this module
    #
    # Generally just a private modules handling interface
    #
    def require_js_module(context, *list)
      registry = modules_registry_for(context)

      list.each do |name|
        unless registry.include?(name.to_s)
          registry << name.to_s
        end
      end
    end

    #
    # Returns a list of required JavaScript files for RightJS
    #
    def required_js_files(context)
      scripts = ['right']
      config  = RightRails::Config


      if config.include_scripts_automatically?
        # hooking up the 'rails' javascript module if required
        scripts << 'right/rails' if config.include_rails_module?

        # adding the modules if needed
        scripts += modules_registry_for(context).collect do |package|
          "right/#{package}"
        end

        # swapping to the sources in the development mode
        if config.swap_builds_and_sources? && config.dev_env?
          scripts = scripts.collect do |package|
            "#{package}-src"
          end
        end

        # loading up the locales if available
        if defined?(I18n)
          locale_file = "#{config.locales_path}/#{I18n.locale.to_s.downcase}"

          if File.exists? "#{locale_file}.js"
            scripts << locale_file.slice(config.public_path.size + "/javascripts/".size, locale_file.size)
          end
        end
      end

      # switching to CDN server if asked
      if !config.dev_env? && config.use_cdn_in_production?
        scripts.map! do |script|
          header  = File.read("#{config.public_path}/javascripts/#{script}.js", 100)

          if version = header[/\d+\.\d+\.\d+/]
            script += "-#{version}"
          end

          if script.slice(0, 6) == 'right/' # plugins and modules
            script.gsub! 'right/', (
              header.include?('/ui/') ? 'ui/' : 'plugins/'
            )
            script.gsub! 'plugins/', '' if script.include?('/i18n/')
          end

          "#{config.cdn_url}/#{script}.js"
        end
      end

      scripts
    end

    #
    # Returns the rightjs-modules registry for the context
    #
    def modules_registry_for(context)
      context.instance_eval do
        return @___rightjs_modules_registry ||= []
      end
    end

    #
    # Collects the RightJS unit options out of the given list of options
    #
    # NOTE: will nuke matching keys out of the original options object
    #
    # @param user's options
    # @param unit name
    #
    def unit_options(options, unit)
      unit_options = []
      unit_keys    = get_keys_for(unit)

      options.dup.each do |key, value|
        c_key = key.to_s.camelize.gsub!(/^[A-Z]/){ |m| m.downcase }

        if unit_keys.include?(c_key)
          value = options.delete key

          value = case value.class.name.to_sym
            when :NilClass then 'null'
            when :Symbol   then c_key == 'method' ? "'#{value}'" : "#{value}"
            when :String   then "'#{value}'"
            else                value.inspect
          end

          unit_options << "#{c_key}:#{value}"
        end
      end

      "{#{unit_options.sort.join(',')}}"
    end

    #
    # Adds the unit options to the options list
    #
    def add_unit_options(options, unit)
      options_string = unit_options(options, unit)

      if RightRails::Config.rightjs_version > 1
        options["data-#{unit}"] = options_string
      elsif options_string != '{}'
        options["data-#{unit}-options"] = options_string
      end

      options
    end

    #
    # Removes the unit option keys out of the given options
    #
    def remove_unit_options(options, unit)
      unit_keys = get_keys_for(unit)
      options.reject{ |k, v| unit_keys.include?(k.to_s) }
    end

    # returns a list of keys for the unit
    def get_keys_for(unit)
      const_get("#{unit.to_s.upcase}_OPTION_KEYS") || []
    end

    #
    # Builds a RightJS based Xhr request call
    #
    def build_xhr_request(options)
      xhr = options[:submit] ?
        "new #{RightRails::Helpers.prefix}Xhr(" :
        "#{RightRails::Helpers.prefix}Xhr.load("

      xhr << "'#{options[:url]}'"

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
        template = options[:position] ?
          "#{prefix}$('%s').insert(this.text,'%s')" :
          "#{prefix}$('%s').update(this.text)%s"

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
      xhr.gsub! /^.+?(,|(\)))/, prefix + '$(this).send(\2'  if options[:form]

      xhr
    end

  end

end