require File.dirname(__FILE__) + "/../../../spec_helper.rb"

describe RightRails::Helpers::Misc do
  include ActionView::Helpers::UrlHelper
  include ActionView::Helpers::TagHelper
  include ActionView::Helpers::TextHelper
  include RightRails::Helpers::Misc
  
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
    end
  end
end
