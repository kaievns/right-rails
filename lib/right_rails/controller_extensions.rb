#
# The ActionController extensions
#
#
module RightRails::ControllerExtensions
  
  #
  # This method returns a wrapped RightRails scripts builder
  #
  #
  def rjs(&block)
    @right_rails_render_wrapper ||= RenderWrapper.new(self)
    
    if block_given?
      @right_rails_render_wrapper.render_block(&block)
    else
      @right_rails_render_wrapper
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
    def initialize(controller)
      @controller = controller
      @generator  = RightRails::JavaScriptGenerator.new(@controller)
    end
    
    def insert(record, options={})
      render @generator.rr.insert(record), options
    end
    
    def replace(record, options={})
      render @generator.rr.replace(record), options
    end
    
    def remove(record, options={})
      render @generator.rr.remove(record), options
    end
    
    def show_form_for(record, options={})
      render @generator.rr.show_form_for(record), options
    end
    
    def replace_form_for(record)
      render @generator.rr.replace_form_for(record), options
    end
    
    def render_block(&block)
      render yield(@generator), options
    end
    
  protected
    
    def render(text, options)
      @controller.instance_eval do
        render options.merge(:text => text.to_s)
      end
    end
  end
  
end