#
# The right-rails scripts generator
#
class RightRails::JavaScriptGenerator
  
  def initialize(template)
    @util         = Util.new(template)
    @rr_generator = RRGenerator.new(@util)
    
    MethodCall.util = self
  end
  
  def rr
    @rr_generator
  end
  
  def [](record_or_id)
    MethodCall.new("$(\"#{@util.dom_id(record_or_id)}\")")
  end
  
  def method_missing(name, *args)
    MethodCall.new("#{name}(#{@util.js_args(args)})")
  end
  
  def document
    MethodCall.new("document")
  end
  
  def window
    MethodCall.new("window")
  end
  
  def top
    MethodCall.new("top")
  end
  
protected

  #
  # Keeps the javascript method calls sequence and then represents iteslf like a string of javascript
  #
  class MethodCall
    cattr_accessor :util
    
    def initialize(parent)
      @parent    = parent
    end
    
    # catches the properties request
    def [](name)
      MethodCall.new("#{@parent}[#{name}]")
    end
    
    # catches all the method calls
    def method_missing(name, *args)
      MethodCall.new("#{@parent}.#{name}(#{self.class.util.js_args(args)})")
    end
    
    # operations
    def +(value)
      MethodCall.new("#{@parent} + ")
    end
    
    def -(value)
      MethodCall.new("#{@parent} - ")
    end
    
    # exports the whole thing into a String
    def to_s
      "#{@parent};"
    end
  end
  
  #
  # RightRails javascript driver methods calling generator
  #
  class RRGenerator
    def initialize(util)
      @util = util
    end
    
    def insert(record)
      "RR.insert(\"#{record.class.table_name}\", \"#{@util.render(record)}\")"
    end

    def replace(record)
      "RR.replace(\"#{@util.dom_id(record)}\", \"#{@util.render(record)}\")"
    end

    def remove(record)
      "RR.remove(\"#{@util.dom_id(record)}\")"
    end

    def show_form_for(record)
      "RR.show_form_for(\"#{@util.dom_id(record)}\", \"#{@util.render('form')}\")"
    end

    def replace_form_for(record)
      id = record.new_record? ? "new_#{record.class.table_name.singularize}" : "edit_#{@util.dom_id(record)}"
      "RR.replace_form_for(\"#{id}\", \"#{@util.render('form')}\")"
    end
  end
  
  #
  # We use this class to cleanup the main namespace of the JavaScriptGenerator instances
  # So that the mesod_missing didn't interferate with the util methods
  #
  class Util
    
    def initialize(template)
      @template
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
      @template.javascript_escape(@template.render(what, options))
    end

    # converts the list of values into a javascript function arguments list
    def js_args(args)
      # TODO procs to functions convertion
      # TODO :this, :self, :top, :document, :window calls handling
      args.collect(&:to_json).join(',')
    end
  end
  
end