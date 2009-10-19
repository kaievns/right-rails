require File.dirname(__FILE__) + "/../../../spec_helper.rb"

describe RightRails::Helpers::Forms do
  include ActionView::Helpers::TagHelper
  include ActionView::Helpers::FormTagHelper
  include RightRails::Helpers::Basic
  include RightRails::Helpers::Forms
  
  def url_for(options)   options end
  def escape_javascript(str) str end
  
  it "should generate a #calendar_field_tag" do
    calendar_field_tag('name', 'value').should == 
      %Q{<input id="name" name="name" rel="calendar" type="text" value="value" />}
    
    @_right_scripts.should == ['calendar']
  end
  
  it "should generate a #calendar_field_tag with options" do
    calendar_field_tag('name', 'value', :format => '%Y/%m/%d').should ==
      %Q{<input data-calendar-options="{format:'%Y/%m/%d'}" id="name" name="name" rel="calendar" type="text" value="value" />}
  end
  
  it "should generate a #autocomplete_field_tag" do
    autocomplete_field_tag('name', 'value', :url => '/foo').should ==
      %Q{<input autocomplete="off" id="name" name="name" rel="autocompleter[/foo]" type="text" value="value" />}
      
    @_right_scripts.should == ['autocompleter']
  end
  
  it "should generate a #autocomplete_field_tag with options" do
    autocomplete_field_tag('name', 'value', :url => '/foo', :spinner => 'spinner', :min_length => 2).should ==
      %Q{<input autocomplete="off" data-autocompleter-options="{minLength:2,spinner:'spinner'}" id="name" name="name" rel="autocompleter[/foo]" type="text" value="value" />}
  end
end