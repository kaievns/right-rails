require File.dirname(__FILE__) + "/../../spec_helper.rb"

class DummyController
  include RightRails::ControllerExtensions
  
  attr_accessor :template
end

module Mime
  JS   = 'text/javascript'
  HTML = 'text/html'
end

describe RightRails::ControllerExtensions do
  before :each do
    @controller = DummyController.new
    
    @template   = mock(:template, {:_evaluate_assigns_and_ivars => nil})
    @controller.template = @template
    
    @generator = RightRails::JavaScriptGenerator.new(@template)
    RightRails::JavaScriptGenerator.stub!(:new).with(@template).and_return(@generator)
  end
  
  it "should provide the #rjs method" do
    @controller.should respond_to(:rjs)
  end
  
  it "should bypass simple calls to the JavaScriptGenerator" do
    @generator.should_receive(:alert).with('that')
    @generator.should_receive(:to_s).and_return('the script')
    
    @controller.rjs.alert("that").should == {:text => 'the script', :content_type => Mime::JS}
  end
  
  it "should process blocks properly" do
    @generator.should_receive(:alert).with('boo')
    @generator.should_receive(:confirm).with('foo')
    
    @generator.should_receive(:to_s).and_return('the script')
    
    @controller.rjs do |page|
      page.alert('boo')
      page.confirm('foo')
    end.should == {:text => 'the script', :content_type => Mime::JS}
  end
  
  it "should let you overload the options" do
    @generator.should_receive(:alert).with('boo')
    @generator.should_receive(:to_s).and_return('the script')
    
    @controller.rjs(:content_type => Mime::HTML, :layout => 'something').alert('boo').should == {
      :text => 'the script', :content_type => Mime::HTML, :layout => 'something'
    }
  end
end