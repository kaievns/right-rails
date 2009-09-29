#
# The ActionController extensions
#
#
module RightRails::ControllerExtensions
  
  #
  # This method returns a wrapped RightRails scripts builder
  #
  #
  def rjs(options={}, &block)
    @template.send(:_evaluate_assigns_and_ivars)
    
    wrapper = RenderWrapper.new(@template)
    
    if block_given?
      wrapper.render_block(options, &block)
    else
      wrapper
    end
  end
  
  #
  # This class wraps the standard JavaScript responses in the controller
  # 
  # It delegates all the scripts generating to the JavaScriptGenerator
  # receives the result mixes the options and then uses the controller's
  # #render method to create a proper response
  #
  class RenderWrapper
    def initialize(template)
      @generator = RightRails::JavaScriptGenerator.new(template)
    end
    
    def render_block(options, &block)
      build yield(@generator), options
    end
    
    #
    # The RR interface methods proxy
    #
    def insert(record, options={})
      build @generator.rr.insert(record), options
    end
    
    def replace(record, options={})
      build @generator.rr.replace(record), options
    end
    
    def remove(record, options={})
      build @generator.rr.remove(record), options
    end
    
    def show_form_for(record, options={})
      build @generator.rr.show_form_for(record), options
    end
    
    def replace_form_for(record)
      build @generator.rr.replace_form_for(record), options
    end
    
  protected
    
    #
    # Compiles the options for the controller#render method
    #
    def render(source, options)
      result = {:text => "#{source}", :content_type => Mime::JS}
      
      # TODO iframed uploads content-type and layout overriding
      
      result.merge(options)
    end
  end
  
end