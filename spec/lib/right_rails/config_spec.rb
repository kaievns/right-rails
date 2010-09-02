require File.dirname(__FILE__) + "/../../spec_helper.rb"

describe RightRails::Config do
  before :each do
    @config = RightRails::Config
    @config.reset!
  end
  
  describe "by default" do
    it "should use the Rails.env by default" do
      Rails.should_receive(:env).and_return('production')
      @config.env.should == 'production'
    end
    
    it "should use the Rails.public_path" do
      Rails.should_receive(:public_path).and_return("/rails/public")
      @config.public_path.should == "/rails/public"
    end
    
    it "should return correct locales_path" do
      @config.locales_path.should == "#{@config.public_path}/#{@config::DEFAULT_LOCALES_LOCATION}"
    end
    
    it "should be in the normal mode" do
      @config.safe_mode.should == false
    end
    
    it "should be in RightJS 2 mode" do
      @config.rightjs_version.should == 2
    end
    
    it "should require rails module" do
      @config.include_rails_module.should == true
    end
    
    it "should swap builds and sources" do
      @config.swap_builds_and_sources.should == true
    end
    
    it "should include scripts automatically" do
      @config.include_scripts_automatically.should == true
    end
    
    describe "with non-standard right.js" do
      before :each do
        File.should_receive(:read).with(
          "#{@config.public_path}/#{@config::DEFAULT_RIGHTJS_LOCATION}"
        ).and_return(%Q{
          RightJS={version: "1.5.6"};
          RightJS.safe = true;
        });
      end
      
      it "should be in safe-mode" do
        @config.safe_mode.should == true
      end

      it "should be in RightJS 1 mode" do
        @config.rightjs_version.should == 1
      end
    end
    
    describe "without Rails" do
      before :each do 
        Object.should_receive(:const_get).with(:Rails).and_return(nil)
      end
      
      it "should fall in 'production' env" do
        @config.env.should == 'production'
      end
      
      it "should use a different path when there is no Rails" do
        @config.public_path.should == "public"
      end
    end
  end
  
  describe "with custom settings" do
    it "should be in a development environment when told" do
      @config.env = 'development'
      @config.env.should == 'development'
    end
    
    it "should allow to change the public_path" do
      @config.public_path = 'some/place/'
      @config.public_path.should == 'some/place'
    end
    
    it "should allow to change the locales location" do
      @config.locales_path = "boo/hoo"
      @config.locales_path.should == 'boo/hoo'
    end
    
    it "should be in safe mode when said so" do
      @config.safe_mode = true
      @config.safe_mode.should == true
    end
    
    it "should remain in RightJS 1 mode if said so" do
      @config.rightjs_version = 1
      @config.rightjs_version.should == 1
    end
    
    it "should not include rails module if asked" do
      @config.include_rails_module = false
      @config.include_rails_module.should == false
    end
    
    it "should not swap between builds and sources if asked" do
      @config.swap_builds_and_sources = false
      @config.swap_builds_and_sources.should == false
    end
    
    it "should not include files automatically if asked" do
      @config.include_scripts_automatically = false
      @config.include_scripts_automatically.should == false
    end
  end
  
  describe ".dev_env? method" do
    it "should return true in the 'development' environment" do
      @config.env = 'development'
      @config.dev_env?.should == true
    end
    
    it "should return false in the 'production' environment" do
      @config.env = 'production'
      @config.dev_env?.should == false
    end
  end
end