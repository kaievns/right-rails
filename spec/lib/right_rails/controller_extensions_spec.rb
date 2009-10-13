require File.dirname(__FILE__) + "/../../spec_helper.rb"

class DummyController
  include RightRails::ControllerExtensions
  
  attr_accessor :template
  attr_accessor :request
end

describe RightRails::ControllerExtensions do
  before :each do
    @controller = DummyController.new
    
    @request    = mock(:request, {:content_type => Mime::JS})
    
    @template   = mock(:template, {:_evaluate_assigns_and_ivars => nil, :request => @request})
    @controller.template = @template
    
    @generator = RightRails::JavaScriptGenerator.new(@template)
    RightRails::JavaScriptGenerator.stub!(:new).with(@template).and_return(@generator)
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
  
  it "should overload content-type and layout for the iframed uploads" do
    @request.should_receive(:content_type).and_return('multipart/form-data')
    @generator.should_receive(:update)
    @generator.should_receive(:to_s).and_return('the script')
    
    @controller.rjs.update.should == {
      :text => 'the script', :content_type => Mime::HTML, :layout => 'iframed'
    }
  end
end