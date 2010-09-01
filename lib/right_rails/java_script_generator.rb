#
# The right-rails scripts generator
#
class RightRails::JavaScriptGenerator
  
  def initialize(template, thread=nil)
    @util = Util.new(template, thread)
  end
  
  # the top-level constants that the generator should respond to transparently
  JS_CONSTANTS = [:document, :window, :top, :RR]
  
  # method calls catchup
  def method_missing(name, *args)
    @util.record(if JS_CONSTANTS.include?(name)
      name
    elsif name.to_s[name.to_s.size-1, name.to_s.size] == '='
      "#{name.to_s[0, name.to_s.size-1]}=#{@util.to_js_type(args.first)}"
    else
      "#{name}(#{@util.to_js_args(args)})"
    end)
  end
  
  # returns the result script
  def to_s
    @util.build_script
  end
  
  #
  # This module contains the predefined methods collection
  #
  module Methods
    # referring an element by an id or a record
    def [](record_or_id)
      @util.record("#{RightRails::Helpers.prefix}$(\"#{@util.dom_id(record_or_id)}\")")
    end

    # just pushes a line of code into the thread
    def << (code)
      @util.write(code)
      self
    end

    # builds a css-select block
    def find(css_rule)
      @util.record("#{RightRails::Helpers.prefix}$$(\"#{css_rule}\")")
    end

    # access to the javascript variables
    def get(name)
      @util.record(name)
    end

    # variables initializing method
    def set(name, value)
      @util.record("var #{name}=#{@util.to_js_type(value)}")
    end

    # generates the redirection script
    def redirect_to(location)
      self.document[:location].href = (location.is_a?(String) ? location : @util.template.url_for(location))
      self
    end

    # generates the page reload script
    def reload
      self.document[:location].reload
      self
    end

    # builds the record HTML code and then insterts it in place
    def insert(record, position=nil)
      self.RR.insert(*[record.class.table_name, @util.render(record), position].compact)
    end
    
    # generates a script that inserts the record partial, then updates the form and the flashes block
    def insert_and_care(record, position=nil)
      insert(record, position)
      @util.template.instance_variable_set("@#{record.class.table_name.singularize}", record.class.new)
      replace_form_for(record.class.new)
      update_flash
    end

    # replaces the record element on the page
    def replace(record)
      self.RR.replace(@util.dom_id(record), @util.render(record))
    end

    # replaces the record partial and updates the flash
    def replace_and_care(record)
      replace(record)
      update_flash
    end

    # removes the record element from the page
    def remove(record)
      self.RR.remove(@util.dom_id(record))
    end

    # renders and shows a form for the record
    def show_form_for(record)
      self.RR.show_form_for(@util.dom_id(record), @util.render('form'))
    end

    # renders and updates a form for the record
    def replace_form_for(record)
      self.RR.replace_form(@util.form_id_for(record), @util.render('form'))
    end
    
    # updates the flashes block
    def update_flash(content=nil)
      self.RR.update_flash(content || @util.template.flashes)
      @util.template.flash.clear
    end
  end
  
  include Methods
  
protected

  #
  # Keeps the javascript method calls sequence and then represents iteslf like a string of javascript
  #
  class MethodCall
    
    def initialize(this, util, parent)
      @this   = this
      @util   = util
      @parent = parent
    end
    
    # catches the properties request
    def [](name)
      @child = @util.make_call(".#{name}", self)
    end
    
    # attribute assignment hook
    def []=(name, value)
      send "#{name}=", value
    end
    
    OPERATIONS = %w{+ - * / % <<}
    
    # catches all the method calls
    def method_missing(name, *args, &block)
      name = name.to_s
      args << block if block_given?
      
      @child = @util.make_call((
        # assignments
        if name[name.size-1, name.size] == '='
          ".#{name[0,name.size-1]}=#{@util.to_js_type(args.first)}"
          
        # operation calls
        elsif OPERATIONS.include?(name)
          name = "+=" if name == '<<'
          "#{name}#{@util.to_js_type(args.first)}"
          
        # usual method calls
        else
          ".#{name}(#{@util.to_js_args(args)})"
        end
      ), self)
    end
    
    # exports the whole thing into a javascript string
    def to_s
      nodes = []
      node = self
      
      while node
        nodes << node
        node = node.instance_variable_get(@parent.nil? ? "@child" : "@parent")
      end
      
      # reversing the calls list if building from the right end
      nodes.reverse! unless @parent.nil?
      
      nodes.collect{|n| n.instance_variable_get("@this").to_s }.join('')
    end
  end
  
  #
  # We use this class to cleanup the main namespace of the JavaScriptGenerator instances
  # So that the mesod_missing didn't interferate with the util methods
  #
  class Util
    attr_reader :template
    
    def initialize(template, thread=nil)
      @template = template
      @thread   = thread || []
    end
    
    # returns a conventional dom id for the record
    def dom_id(record)
      if [String, Symbol].include?(record.class)
        "#{record}"
      else
        @template.dom_id(record)
      end
    end
    
    # generates the form-id for the given record
    def form_id_for(record)
      record.new_record? ? "new_#{record.class.table_name.singularize}" : "edit_#{dom_id(record)}"
    end

    # retnders the thing
    def render(what)
      @template.render(what)
    end
    
    # builds a new method call object
    def make_call(string, parent=nil)
      MethodCall.new(string, self, parent)
    end
    
    # Records a new call
    def record(command)
      @thread << (line = make_call(command))
      line
    end
    
    # writes a pline script code into the thread
    def write(script)
      @thread << script
    end
    
    # builds the end script
    def build_script
      @thread.collect{|line|
        line.is_a?(String) ? line : (line.to_s + ';')
      }.join('')
    end

    # converts the list of values into a javascript function arguments list
    def to_js_args(args)
      args.collect do |value|
        to_js_type(value)
      end.join(',')
    end
    
    # converts any ruby type into an javascript type
    def to_js_type(value)
      case value.class.name.to_sym
        when :Float, :Fixnum, :TrueClass, :FalseClass, :Symbol then value.to_s
        when :String   then "\"#{@template.escape_javascript(value)}\""
        when :NilClass then 'null'
        when :Array    then "[#{to_js_args(value)}]"
        when :Proc     then proc_to_function(&value)
        else
            
          # the other method-calls processing
          if value.is_a?(MethodCall)
            # removing the call out of the calls thread
            top    = value
            parent = value
            while parent
              top    = parent
              parent = parent.instance_variable_get('@parent')
            end
            @thread.reject!{ |item| item == top }
            
            value.to_s
            
          # simple hashes processing
          elsif value.is_a?(Hash)
            pairs = []
            value.each do |key, value|
              pairs << "#{to_js_type(key)}:#{to_js_type(value)}"
            end
            "{#{pairs.sort.join(',')}}"
          
          # JSON exportable values processing
          elsif value.respond_to?(:to_json)
            to_js_type(value.to_json)
          
          # throwing an ansupported class name
          else
            throw "RightRails::JavaScriptGenerator doesn't support instances of #{value.class.name} yet"
          end
      end
    end
    
    # converts a proc into a javascript function
    def proc_to_function(&block)
      thread = []
      args   = []
      names  = []
      name   = 'a'
      page   = RightRails::JavaScriptGenerator.new(@template, thread)
      
      block.arity.times do |i|
        args  << page.get(name)
        names << name
        name = name.succ
      end
      
      # swapping the current thread with the block's one
      old_thread = @thread
      @thread = thread
      
      yield(*args)
      
      # swapping the current therad back
      @thread = old_thread
      
      "function(#{names.join(',')}){#{page.to_s}}"
    end
  end
  
end