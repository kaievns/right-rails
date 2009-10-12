require File.dirname(__FILE__) + "/../../../spec_helper.rb"
require 'action_view'

describe RightRails::Helpers::Basic do
  include RightRails::Helpers::Basic
  include ActionView::Helpers::TagHelper
  
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
  
  it "should build the basic javascript include tags" do
    should_receive(:javascript_include_tag).with(*%w{right right/rails})
    rightjs_scripts
  end
  
  it "should catch the optional modules" do
    @_right_scripts = %w{lightbox dnd}
    
    should_receive(:javascript_include_tag).with(*%w{right right/rails right/lightbox right/dnd})
    
    rightjs_scripts
  end
  
  it "should load internationalization modules if defined" do
    should_receive(:javascript_include_tag).with(*%w{right right/rails right/i18n/ru})
    
    I18n.locale = 'ru'
    RAILS_ROOT = "rails-root"
    File.should_receive(:exists?).with("rails-root/public/javascripts/right/i18n/ru.js").and_return(true)
    
    rightjs_scripts
  end
  
  it "should not include non-existing locales" do
    should_receive(:javascript_include_tag).with(*%w{right right/rails})
    
    I18n.locale = 'some-weird-stuff'
    File.should_receive(:exists?).with("rails-root/public/javascripts/right/i18n/some-weird-stuff.js").and_return(false)
    
    rightjs_scripts
  end
  
  it "should use the source scripts in the development environment" do
    should_receive(:javascript_include_tag).with(*%w{right-src right/rails-src})
    
    RAILS_ENV = 'development'
    
    rightjs_scripts
  end
  
  it "should build a script-generator for the rjs method" do
    rjs.should be_a(RightRails::JavaScriptGenerator)
  end
  
  it "should generate scripts with rjs one-liners" do
    rjs.boo.boo.boo.to_s.should == 'boo().boo().boo()'
  end
  
  it "should generate scripts with rjs blocks" do
    rjs do |page|
      page.boo.boo.boo
    end.to_s.should == 'boo().boo().boo();'
  end
  
  it "should generate a proper javascript tag construction" do
    should_receive(:javascript_tag).and_return('javascript_tag')
    
    rjs_tag do |page|
      page.boo.boo.boo
    end.to_s.should == 'javascript_tag'
  end
end