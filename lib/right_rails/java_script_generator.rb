#
# The right-rails scripts generator
#
class RightRails::JavaScriptGenerator
  
  def initialize(template, thread=nil)
    @util         = Util.new(template)
    @rr_generator = RRGenerator.new(@util, self)
    @thread       = thread || []
  end
  
  # the global RR handler reference
  def rr
    @rr_generator
  end
  
  # referring an element by an id or a record
  def [](record_or_id)
    @thread << (line = @util.call("$(\"#{@util.dom_id(record_or_id)}\")"))
    line
  end
  
  # builds a css-select block
  def find(css_rule)
    @thread << (line = @util.call("$$(\"#{css_rule}\")"))
    line
  end
  
  # just pushes a line of code into the thread
  def << (code)
    @thread << code
    self
  end
  
  # the top-level constants that the generator should respond to transparently
  JS_CONSTANTS = [:document, :window, :top, :RR]
  
  # method calls catchup
  def method_missing(name, *args)
    @thread << (line = @util.call(if JS_CONSTANTS.include?(name)
      name
    elsif name.to_s[name.to_s.size-1, name.to_s.size] == '='
      "#{name.to_s[0, name.to_s.size-1]}=#{@util.js_args(args.slice(0,1))}"
    else
      "#{name}(#{@util.js_args(args)})"
    end))
    
    line
  end
  
  # returns the result script
  def to_s
    @thread.collect{|line|
      line.is_a?(String) ? line : (line.to_s + ';')
    }.join('')
  end
  
protected

  #
  # Keeps the javascript method calls sequence and then represents iteslf like a string of javascript
  #
  class MethodCall
    
    def initialize(parent, util)
      @parent = parent
      @util   = util
    end
    
    # catches the properties request
    def [](name)
      @child = @util.call(".#{name}")
    end
    
    # catches all the method calls
    def method_missing(name, *args)
      @child = @util.call(".#{name}(#{@util.js_args(args)})")
    end
    
    # operations
    def +(value)
      @child = @util.call("#{@parent} + ")
    end
    
    def -(value)
      @child = @util.call("#{@parent} - ")
    end
    
    # exports the whole thing into a String
    def to_s
      @parent.to_s + (@child || '').to_s
    end
  end
  
  #
  # RightRails javascript driver methods calling generator
  #
  class RRGenerator
    def initialize(util, page)
      @util = util
      @page = page
    end
    
    def insert(record)
      @page.RR.insert(record.class.table_name, @util.render(record))
    end

    def replace(record)
      @page.RR.replace(@util.dom_id(record), @util.render(record))
    end

    def remove(record)
      @page.RR.remove(@util.dom_id(record))
    end

    def show_form_for(record)
      @page.RR.show_form_for(@util.dom_id(record), @util.render('form'))
    end

    def replace_form_for(record)
      id = record.new_record? ? "new_#{record.class.table_name.singularize}" : "edit_#{@util.dom_id(record)}"
      @page.RR.replace_form_for(id, @util.render('form'))
    end
  end
  
  #
  # We use this class to cleanup the main namespace of the JavaScriptGenerator instances
  # So that the mesod_missing didn't interferate with the util methods
  #
  class Util
    
    def initialize(template)
      @template = template
    end
    
    # returns a conventional dom id for the record
    def dom_id(record)
      if record.is_a?(ActiveRecord::Base) || record.is_a?(ActiveResource::Base)
        @template.dom_id(record)
      else 
        "#{record}"
      end
    end

    # retnders the thing
    def render(what, options={})
      @template.render(what, options)
    end
    
    # builds a new method call object
    def call(string)
      MethodCall.new(string, self)
    end

    # converts the list of values into a javascript function arguments list
    def js_args(args)
      args.collect do |value|
        case value.class.name.to_sym
          when :Float, :Fixnum, :TrueClass, :FalseClass, :Symbol then value.to_s
          when :String   then "\"#{@template.escape_javascript(value)}\""
          when :NilClass then 'null'
          when :Array    then "[#{js_args(value)}]"
          else
            
            # simple hashes processing
            if value.is_a?(Hash)
              pairs = []
              value.each do |key, value|
                pairs << "#{js_args([key])}:#{js_args([value])}"
              end
              "{#{pairs.sort.join(',')}}"
            
            # JSON exportable values processing
            elsif value.respond_to?(:to_json)
              js_args([value.to_json])
            
            
            # throwing an ansupported class name
            else
              throw "RightRails::JavaScriptGenerator doesn't instances of '#{value.class.name}' yet"
            end
        end
      end.join(',')
    end
  end
  
end