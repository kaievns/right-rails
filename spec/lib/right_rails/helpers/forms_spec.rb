require File.dirname(__FILE__) + "/../../../spec_helper.rb"

describe RightRails::Helpers::Forms do
  include ActionView::Helpers::TagHelper
  include ActionView::Helpers::FormTagHelper
  include ActionView::Helpers::JavaScriptHelper
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
  
  it "should generate a #slider_tag with options" do
    slider_tag('some_field', 22, :min => 10, :max => 40).should ==
      %Q{<input id="some_field" name="some_field" type="hidden" value="22" />\n<script type="text/javascript">\n//<![CDATA[\nnew Slider({max:40,min:10,value:22}).insertTo('some_field','after').assignTo('some_field');\n//]]>\n</script>}
  end
  
  it "should generate a #rater_tag" do
    rater_tag('some_field', 2).should ==
      %Q{<input id="some_field" name="some_field" type="hidden" value="2" />\n<script type="text/javascript">\n//<![CDATA[\nnew Rater({value:2}).insertTo('some_field','after').assignTo('some_field');\n//]]>\n</script>}
  end
  
  it "should generate the #rater_display tag" do
    rater_display(4).should ==
      %Q{<div class="right-rater right-rater-disabled"><div class="right-rater-glow">&#9733;</div><div class="right-rater-glow">&#9733;</div><div class="right-rater-glow">&#9733;</div><div class="right-rater-glow">&#9733;</div><div>&#9733;</div></div>}
  end
end