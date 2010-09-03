require File.dirname(__FILE__) + "/../../../spec_helper.rb"

describe RightRails::Helpers::Forms do
  include ActionView::Helpers::TagHelper
  include ActionView::Helpers::FormTagHelper
  include ActionView::Helpers::JavaScriptHelper
  include RightRails::Helpers::Basic
  include RightRails::Helpers::Forms
  
  def url_for(options)   options end
  def escape_javascript(str) str end
  def rightjs_required_files
    RightRails::Helpers.required_js_files(self)
  end
  
  describe ".calendar_field" do
    it "should generate a basic calendar_field_tag" do
      calendar_field_tag('name', 'value').should == 
        %Q{<input id="name" name="name" rel="calendar" type="text" value="value" />}

      rightjs_required_files.should include('right/calendar')
    end

    it "should generate a calendar_field_tag with options" do
      calendar_field_tag('name', 'value', :format => '%Y/%m/%d').should ==
        %Q{<input data-calendar-options="{format:'%Y/%m/%d'}" id="name" name="name" }+
          %Q{rel="calendar" type="text" value="value" />}
    end
    
    it "should generate a basic calendar_field" do
      calendar_field('model', 'method').should ==
        %Q{<input id="model_method" name="model[method]" rel="calendar" size="30" type="text" />}
    end
    
    it "should generate a calendar_field with options" do
      calendar_field('model', 'method', :hide_on_pick => true).should ==
        %Q{<input data-calendar-options="{hideOnPick:true}" id="model_method" }+
          %Q{name="model[method]" rel="calendar" size="30" type="text" />}
    end
  end
  
  describe ".autocomplete_field" do
    it "should generate a basic autocomplete_field_tag" do
      autocomplete_field_tag('name', 'value', :url => '/foo').should ==
        %Q{<input autocomplete="off" id="name" name="name" rel="autocompleter[/foo]" type="text" value="value" />}

      rightjs_required_files.should include('right/autocompleter')
    end

    it "should generate an autocomplete_field_tag with options" do
      autocomplete_field_tag('name', 'value', :url => '/foo', :spinner => 'spinner', :min_length => 2).should ==
        %Q{<input autocomplete="off" data-autocompleter-options="{minLength:2,spinner:'spinner'}" }+
          %Q{id="name" name="name" rel="autocompleter[/foo]" type="text" value="value" />}
    end
    
    it "should generate a basic autocomplete_field" do
      autocomplete_field('object', 'method', :url => '/foo').should ==
        %Q{<input autocomplete="off" id="object_method" name="object[method]" rel="autocompleter[/foo]" size="30" type="text" />}
    end
    
    it "should generate an autocomplete_field with options" do
      autocomplete_field('object', 'method', :url => '/foo', :fx_name => 'fade').should ==
        %Q{<input autocomplete="off" data-autocompleter-options="{fxName:'fade'}" id="object_method" }+
          %Q{name="object[method]" rel="autocompleter[/foo]" size="30" type="text" />}
    end
  end
  
  describe ".slider" do
    it "should generate a basic slider_tag" do
      slider_tag('some_field', 22).should ==
        %Q{<input id="some_field" name="some_field" type="hidden" value="22" />\n}+
          %Q{<script type="text/javascript">\n//<![CDATA[\n}+
            %Q{new Slider({value:22}).insertTo('some_field','after').assignTo('some_field');\n}+
          %Q{//]]>\n}+
        %Q{</script>}
    end
    
    it "should generate a slider_tag with options" do
      slider_tag('some_field', 22, :min => 10, :max => 40).should ==
        %Q{<input id="some_field" name="some_field" type="hidden" value="22" />\n}+
          %Q{<script type="text/javascript">\n//<![CDATA[\n}+
            %Q{new Slider({max:40,min:10,value:22}).insertTo('some_field','after').assignTo('some_field');\n}+
          %Q{//]]>\n}+
        %Q{</script>}
    end
    
    it "should generate a slider with options" do
      slider('object', 'method', :value => 22, :min => 20, :max => 80).should ==
        %Q{<input id="object_method" name="object[method]" type="hidden" />\n}+
          %Q{<script type="text/javascript">\n//<![CDATA[\n}+
            %Q{new Slider({max:80,min:20,value:22}).insertTo('object_method','after').assignTo('object_method');\n}+
          %Q{//]]>\n}+
        %Q{</script>}
    end
  end
  
  describe ".rater" do
    it "should generate a simple rater" do
      rater('object', 'method', :value => 2).should ==
        %Q{<input id="object_method" name="object[method]" type="hidden" />\n}+
        %Q{<script type="text/javascript">\n//<![CDATA[\n}+
          %Q{new Rater({value:2}).insertTo('object_method','after').assignTo('object_method');\n}+
        %Q{//]]>\n</script>}
    end
    
    it "should generate a #rater_tag" do
      rater_tag('some_field', 2).should ==
        %Q{<input id="some_field" name="some_field" type="hidden" value="2" />\n}+
        %Q{<script type="text/javascript">\n//<![CDATA[\n}+
          %Q{new Rater({value:2}).insertTo('some_field','after').assignTo('some_field');\n}+
        %Q{//]]>\n</script>}
    end

    it "should generate the #rater_display tag" do
      rater_display(4).should ==
        %Q{<div class="right-rater right-rater-disabled">}+
          %Q{<div class="right-rater-glow">&#9733;</div>}+
          %Q{<div class="right-rater-glow">&#9733;</div>}+
          %Q{<div class="right-rater-glow">&#9733;</div>}+
          %Q{<div class="right-rater-glow">&#9733;</div>}+
          %Q{<div>&#9733;</div>}+
        %Q{</div>}
    end
  end
  
  describe ".colorpicker" do
    it "should generate a simple colorpicker_field_tag" do
      colorpicker_field_tag('name', '#FF0').should == 
        %Q{<input id="name" name="name" rel="colorpicker" type="text" value="#FF0" />}
    end

    it "should generate a colorpicker_field_tag with options" do
      colorpicker_field_tag('name', '#FF0', :format => 'rgb').should == 
        %Q{<input data-colorpicker-options="{format:'rgb'}" }+
          %Q{id="name" name="name" rel="colorpicker" type="text" value="#FF0" />}
    end
    
    it "should generate a colorpicker_field with options" do
      colorpicker_field('object', 'method', :fx_name => 'slide').should ==
        %Q{<input data-colorpicker-options="{fxName:'slide'}" id="object_method" }+
          %Q{name="object[method]" rel="colorpicker" size="30" type="text" />}
    end
  end
  
  
  
  
end