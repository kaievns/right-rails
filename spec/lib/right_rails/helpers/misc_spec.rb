require File.dirname(__FILE__) + "/../../../spec_helper.rb"

describe RightRails::Helpers::Misc do
  include ActionView::Helpers::UrlHelper
  include ActionView::Helpers::TagHelper
  include ActionView::Helpers::TextHelper
  include RightRails::Helpers::Basic
  include RightRails::Helpers::Misc
  
  it "should provide the basic #flashes builder" do
    should_receive(:flash).any_number_of_times.and_return({
      :warning => "Warning!",
      :notice  => "Notice!",
      :error   => "Error!"
    })
    
    flashes.should == '<div id="flashes">'+
      '<div class="error">Error!</div>'+
      '<div class="notice">Notice!</div>'+
      '<div class="warning">Warning!</div>'+
    '</div>'
  end
  
  describe "#autocomplete_result" do
    it "should generate a simple result" do
      autocomplete_result(%w{one two three}).should == '<ul><li>one</li><li>two</li><li>three</li></ul>'
    end
    
    it "should generate result with highlightning" do
      autocomplete_result(%w{one two three}, :highlight => 'o').should == 
        '<ul><li><strong class="highlight">o</strong>ne</li><li>tw<strong class="highlight">o</strong></li><li>three</li></ul>'
    end
    
    it "should escape strings by default" do
      autocomplete_result(['<b>b</b>', '<i>i</i>']).should ==
        %Q{<ul><li>&lt;b&gt;b&lt;/b&gt;</li><li>&lt;i&gt;i&lt;/i&gt;</li></ul>}
    end
    
    it "should not escape strings if asked" do
      autocomplete_result(['<b>b</b>', '<i>i</i>'], :escape => false).should ==
        %Q{<ul><li><b>b</b></li><li><i>i</i></li></ul>}
    end
    
    it "should generate result out of list of records" do
      records = [
        mock(:boo, :boo => 'one'),
        mock(:boo, :boo => 'two')
      ]
      
      autocomplete_result(records, :boo).should == '<ul><li>one</li><li>two</li></ul>'
    end
    
    it "should highlight result when generated out of an objects list" do
      records = [
        mock(:boo, :boo => 'one'),
        mock(:boo, :boo => 'two')
      ]
      
      autocomplete_result(records, :boo, :highlight => 'o').should == 
        %Q{<ul><li><strong class="highlight">o</strong>ne</li><li>tw<strong class="highlight">o</strong></li></ul>}
    end
  end
  
  describe "#link_to_lightbox" do
    it "should generate the link" do
      link_to_lightbox('boo', 'boo').should == '<a href="boo" rel="lightbox">boo</a>'
      @_right_scripts.should == ['lightbox']
    end
    
    it "should generate lightbox with roadtrip" do
      link_to_lightbox('boo', 'boo', :roadtrip => true).should ==
        %Q{<a href="boo" rel="lightbox[roadtrip]">boo</a>}
    end
  end
end
