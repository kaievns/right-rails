require File.dirname(__FILE__) + "/../../../spec_helper.rb"

describe RightRails::Helpers::Rails do
  include ActionView::Helpers::TagHelper
  include ActionView::Helpers::JavaScriptHelper
  include ActionView::Helpers::ScriptaculousHelper
  include ActionView::Helpers::FormTagHelper
  include RightRails::Helpers::Basic
  include RightRails::Helpers::Rails
  
  # stubbing the convertion methods
  def url_for(url)               url    end
  def protect_against_forgery?() false  end
  
  describe "#remote_function" do
    it "should generatorate a simple request" do
      remote_function(:url => '/foo').should == "Xhr.load('/foo')"
    end
    
    it "should let you specify the method" do
      remote_function(:url => '/foo', :method => 'put').should ==
        "Xhr.load('/foo',{method:'put'})"
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
    it "should generate a proper remote form" do
      form_remote_tag(:url => '/boo', :spinner => 'spinner').should ==
        %Q{<form action="/boo" method="post" onsubmit="$(this).send({spinner:'spinner'}); return false;">}
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
    @_right_scripts.should == ['dnd']
  end
  
  it "should generate #drop_receiving_element_js" do
    drop_receiving_element_js(:element_id, :url => '/boo').should == 
      %Q{new Droppable("element_id", {onDrop:function(draggable){Xhr.load('/boo',{params:'id=' + encodeURIComponent(draggable.element.id)})}});}
      
    @_right_scripts.should == ['dnd']
  end
  
  it "should generate #sortable_element_js" do
    sortable_element_js(:element_id, :url => '/stuff/%{id}.js').should ==
      %Q{new Sortable('element_id',{url:'/stuff/%{id}.js'})}
  end
end