require File.dirname(__FILE__) + "/../../../spec_helper.rb"

module ActionView::Helpers::RailsLegacyHelper
  if ''.respond_to?(:html_safe) # oops
    def form_remote_tag(options = {}, &block)
      options[:form] = true
    
      options[:html] ||= {}
      options[:html][:onsubmit] =
        (options[:html][:onsubmit] ? options[:html][:onsubmit] + "; " : "") +
        "#{remote_function(options)}; return false;"
    
      form_tag(options[:html].delete(:action) || url_for(options[:url]), options[:html], &block)
    end
    
    def link_to_remote(name, options = {}, html_options = nil)
      link_to_function(name, remote_function(options), html_options || options.delete(:html))
    end
    
    def link_to_function(name, *args, &block)
      html_options = args.extract_options!.symbolize_keys
    
      function = block_given? ? update_page(&block) : args[0] || ''
      onclick = "#{"#{html_options[:onclick]}; " if html_options[:onclick]}#{function}; return false;"
      href = html_options[:href] || '#'
    
      content_tag(:a, name, html_options.merge(:href => href, :onclick => onclick))
    end
    
    def button_to_remote(name, options = {}, html_options = {})
      button_to_function(name, remote_function(options), html_options)
    end
  end
end

describe RightRails::Helpers::Rails do
  include ActionView::Helpers::TagHelper
  include ActionView::Helpers::JavaScriptHelper
  include ActionView::Helpers::RailsLegacyHelper
  include ActionView::Helpers::ScriptaculousHelper
  include ActionView::Helpers::FormTagHelper
  include RightRails::Helpers::Basic
  include RightRails::Helpers::Rails
  
  # stubbing the convertion methods
  def url_for(url)               url    end
  def protect_against_forgery?() false  end
  def rightjs_required_files
    RightRails::Helpers.required_js_files(self)
  end
    
  before :each do
    RightRails::Config.reset!
  end
    
  describe "#javascript_include_tag" do
    it "should load the RightJS scripts by default" do
      should_receive(:rightjs_scripts).and_return('right.js')
      javascript_include_tag(:defaults).should == 'right.js'
    end
  end
  
  describe "#remote_function" do
    it "should generatorate a simple request" do
      remote_function(:url => '/foo').should == "Xhr.load('/foo')"
    end
    
    it "should let you specify the method" do
      remote_function(:url => '/foo', :method => 'put').should ==
        "Xhr.load('/foo',{method:'put'})"
    end
    
    it "should accept the method parameter as a symbol too" do
      remote_function(:url => '/foo', :method => :post).should ==
        "Xhr.load('/foo',{method:'post'})"
    end
    
    it "should let you specify the spinners" do
      remote_function(:url => '/foo', :spinner => 'my-spinner').should ==
        "Xhr.load('/foo',{spinner:'my-spinner'})"
    end
    
    it "should let you specify the callbacks" do
      remote_function(:url => '/foo', :before => 'before()', :after => 'after()',
      :complete => 'complete()', :success => 'success()', :failure => 'failure()').should ==
        "before();Xhr.load('/foo',{"+
          "onComplete:function(request){complete();},"+
          "onFailure:function(request){failure();},"+
          "onSuccess:function(request){success();}});after()"
    end
    
    it "should work with the 'with' parameter" do
      remote_function(:url => '/foo', :with => "'name='+'boo'").should ==
        "Xhr.load('/foo',{params:'name='+'boo'})"
    end
    
    it "should generate an update call" do
      remote_function(:url => '/foo', :update => 'boo').should == 
        "Xhr.load('/foo',{onComplete:function(request){$('boo').update(this.text)}})"
    end
    
    it "should generate an update for different elements depend on the status" do
      remote_function(:url => '/foo', :update => {:success => "boo", :failure => "moo"}).should == 
        "Xhr.load('/foo',{"+
          "onFailure:function(request){$('moo').update(this.text)},"+
          "onSuccess:function(request){$('boo').update(this.text)}})"
    end
    
    it "should generate update calls with position" do
      remote_function(:url => '/foo', :update => 'boo', :position => :top).should ==
        "Xhr.load('/foo',{onComplete:function(request){$('boo').insert(this.text,'top')}})"
    end
    
    it "should allow to specify the Xhr options" do
      remote_function(:url => '/foo', :evalScripts => true, :encoding => 'cp1251', :params => 'boo=boo').should ==
        "Xhr.load('/foo',{encoding:'cp1251',evalScripts:true,params:'boo=boo'})"
    end
    
    it "should allow the 'condition' option" do
      remote_function(:url => '/foo', :condition => 'boo()').should ==
        "if(boo()){Xhr.load('/foo')}"
    end
    
    it "should allow the 'confirm' option" do
      remote_function(:url => '/foo', :confirm => 'Sure?').should == 
        "if(confirm('Sure?')){Xhr.load('/foo')}"
    end
    
    describe "in safe-mode" do
      before :each do
        RightRails::Config.safe_mode = true
      end
      
      it "should prefix the 'Xhr' calls" do
        remote_function(:url => '/foo').should == "RightJS.Xhr.load('/foo')"
      end
      
      it "should prefix the '$' calls" do
        remote_function(:url => '/foo', :update => 'boo').should ==
          "RightJS.Xhr.load('/foo',{onComplete:function(request){RightJS.$('boo').update(this.text)}})"
      end
    end
  end
  
  describe "#link_to_function" do
    it "should still be working with string commands" do
      link_to_function('click me', "$(this).remove()").should ==
        '<a href="#" onclick="$(this).remove(); return false;">click me</a>'
    end
    
    it "should still be working with blocks" do
      link_to_function('click me') do |page|
        page.alert 'boo'
      end.should == '<a href="#" onclick="alert(&quot;boo&quot;);; return false;">click me</a>'
    end
  end
  
  describe "#button_to_function" do
    it "should be working with string commands" do
      button_to_function('Boo', "alert('boo')").should == %Q{<input onclick="alert('boo');" type="button" value="Boo" />}
    end
    
    it "should be working with the blocks" do
      button_to_function('Boo'){|p| p.alert('boo')}.should == %Q{<input onclick="alert(&quot;boo&quot;);;" type="button" value="Boo" />}
    end
  end
  
  describe "#link_to_remote" do
    it "should generate normal remote calls" do
      link_to_remote('click me', :url => 'boo').should == %Q{<a href="#" onclick="Xhr.load('boo'); return false;">click me</a>}
    end
  end
  
  describe "#button_to_remote" do
    it "should generate normal remote calls" do
      button_to_remote('Boo', :url => '/boo').should == %Q{<input onclick="Xhr.load('/boo');" type="button" value="Boo" />}
    end
  end
  
  describe "#submit_to_remote" do
    it "should generate a proper element" do
      submit_to_remote('name', 'Send', :url => '/foo', :spinner => 'spinner').should ==
        %Q[<input name="name" onclick="new Xhr('/foo',{spinner:'spinner'}).send($(this.form));" type="button" value="Send" />]
    end
  end
  
  describe "#form_remote_tag" do
    it "should generate a simple remote form".should do
      form_remote_tag(:url => '/boo').should =~
        /<form[^>]+#{Regexp.escape(%Q{action="/boo" method="post" onsubmit="$(this).send(); return false;">})}/
    end
    
    it "should generate a proper remote form with options" do
      form_remote_tag(:url => '/boo', :spinner => 'spinner').should =~
        /<form[^>]+#{Regexp.escape(%Q{action="/boo" method="post" onsubmit="$(this).send({spinner:'spinner'}); return false;">})}/
    end
    
    it "should prefix '$' with RightJS. in safe-mode" do
      RightRails::Config.safe_mode = true
      form_remote_tag(:url => '/boo').should =~
        /<form[^>]+#{Regexp.escape(%Q{action="/boo" method="post" onsubmit="RightJS.$(this).send(); return false;">})}/
    end
  end
  
  describe "#periodically_call_remote" do
    it "should generate the script" do
      periodically_call_remote(:url => '/foo').should == 
        %Q{<script type=\"text/javascript\">\n//<![CDATA[\nfunction(){Xhr.load('/foo')}.periodical(10000)\n//]]>\n</script>}
    end
  end
  
  it "should generate #draggable_element_js" do
    draggable_element_js(:element_id, :revert => true).should == 'new Draggable("element_id", {revert:true});'
    rightjs_required_files.should include('right/dnd')
  end
  
  it "should generate #drop_receiving_element_js" do
    drop_receiving_element_js(:element_id, :url => '/boo').should == 
      %Q{new Droppable("element_id", {onDrop:function(draggable){Xhr.load('/boo',{params:'id=' + encodeURIComponent(draggable.element.id)})}});}
    
    rightjs_required_files.should include('right/dnd')
  end
  
  it "should generate #sortable_element_js" do
    sortable_element_js(:element_id, :url => '/stuff/%{id}.js').should ==
      %Q{new Sortable('element_id',{url:'/stuff/%{id}.js'})}
  end
end