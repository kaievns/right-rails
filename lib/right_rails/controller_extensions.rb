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
    
    wrapper = RenderWrapper.new(@template, options)
    
    if block_given?
      wrapper.render_block(&block)
    else
      wrapper
    end
  end
  
  #
  # This class wraps the standard JavaScript responses in the controller
  # 
  # It delegates all the script generating calls to the JavaScriptGenerator
  # instance, then grabs thre reults and creates a suitable hash of options
  # for the ActionController::Base#render method
  #
  class RenderWrapper
    def initialize(template, options)
      @generator = RightRails::JavaScriptGenerator.new(template)
      @options   = options
    end
    
    def render_block(&block)
      yield(@generator)
      render
    end
    
    def method_missing(name, *args)
      @generator.send(name, *args)
      render 
    end
    
  protected
    
    #
    # Compiles the options for the controller#render method
    #
    def render
      result = {:text => @generator.to_s, :content_type => Mime::JS}
      
      # TODO iframed uploads content-type and layout overriding
      
      result.merge! @options
    end
  end
  
end