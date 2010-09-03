require File.dirname(__FILE__) + "/../../../spec_helper.rb"

describe RightRails::Helpers::Basic do
  include RightRails::Helpers::Basic
  include ActionView::Helpers::TagHelper
  
  it "should build the basic javascript include tags" do
    should_receive(:javascript_include_tag).with(*%w{right right/rails})
    rightjs_scripts
  end
  
  it "should respect the options hash at the end" do
    should_receive(:javascript_include_tag).with('right', 'right/rails', :cache => 'rightjs')
    rightjs_scripts :cache => 'rightjs'
  end
  
  it "should catch the optional modules" do
    rightjs_require_module *%w{lightbox dnd}
    
    should_receive(:javascript_include_tag).with(*%w{right right/rails right/lightbox right/dnd})
    
    rightjs_scripts
  end
  
  it "should let to specify the modules as arguments" do
    should_receive(:javascript_include_tag).with(*%w{right right/rails right/lightbox right/dnd})
    
    rightjs_scripts :lightbox, :dnd
  end
  
  it "should load internationalization modules if defined" do
    should_receive(:javascript_include_tag).with(*%w{right right/rails right/i18n/ru})
    
    I18n.locale = 'ru'
    File.should_receive(:exists?).with("rails-root/public/javascripts/right/i18n/ru.js").and_return(true)
    
    rightjs_scripts
  end
  
  it "should not include non-existing locales" do
    should_receive(:javascript_include_tag).with(*%w{right right/rails})
    
    I18n.locale = 'some-weird-stuff'
    File.should_receive(:exists?).with("rails-root/public/javascripts/right/i18n/some-weird-stuff.js").and_return(false)
    
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
  
  it "should use the source scripts in development mode" do
    RightRails::Config.env = 'development'
    should_receive(:javascript_include_tag).with(*%w{right-src right/rails-src})

    rightjs_scripts
    
    RightRails::Config.reset!
  end
end