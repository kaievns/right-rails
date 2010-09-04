#
# The ActionController extensions
#
#
module RightRails::ControllerExtensions
  
  #
  # This method returns a wrapped RightRails scripts builder
  #
  # USAGE:
  #   def create
  #     @zing = Zing.new(params[:zing])
  #     
  #     if @zing.save
  #       flash[:notice] = 'Here you go'
  #       render rjs.insert @zing
  #     else
  #       render rjs.replace_form_for(@zing)
  #     end
  #   end
  #
  #   def alert_that
  #     render rjs.alert 'that'
  #   end
  #
  #   def as_a_block
  #     render rjs do |page|
  #       page[:zings].last.hide('slide')
  #     end
  #   end
  #
  def rjs(options={}, &block)
    template = if @template
      @template.send(:_evaluate_assigns_and_ivars)
      @template
    else
      view_context
    end
    
    wrapper = RenderWrapper.new(template, options)
        
    if block_given?
      wrapper.render_block(&block)
    else
      wrapper
    end
  end
  
private
  
  #
  # This class wraps the standard JavaScript responses in the controller
  # 
  # It delegates all the script generating calls to the JavaScriptGenerator
  # instance, then grabs thre reults and creates a suitable hash of options
  # for the ActionController::Base#render method
  #
  class RenderWrapper
    def initialize(template, options)
      @template  = template
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
    
    #
    # Compiles the options for the controller#render method
    #
    def render
      result = {:text => @generator.to_s, :content_type => Mime::JS}
      
      # iframed uploads context overloading
      if @template.request.content_type == 'multipart/form-data'
        result.merge! :content_type => Mime::HTML, :layout => 'iframed.html.erb'
      end
      
      result.merge! @options
    end
  end
  
end