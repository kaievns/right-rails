require File.dirname(__FILE__) + "/../../spec_helper.rb"

module I18n
end

describe RightRails::Helpers do
  before :each do
    @config = RightRails::Config
    @config.reset!

    @helper = RightRails::Helpers
    @context = {}
  end

  def require_js_module(*list)
    @helper.require_js_module  @context, *list
  end

  def required_js_files
    @helper.required_js_files @context
  end

  def modules_registry
    @helper.send(:modules_registry_for, @context)
  end

  describe ".prefix" do
    it "should be empty in normal mode" do
      @config.safe_mode = false
      @helper.prefix.should == ''
    end

    it "should return 'RightJS.' in safe-mode" do
      @config.safe_mode = true
      @helper.prefix.should == 'RightJS.'
    end
  end

  describe ".html_safe" do
    it "should always return normal strings" do
      @helper.html_safe('<b>boo!</b>').should == '<b>boo!</b>'
    end
  end

  describe ".require_js_module" do
    it "should require files one by one" do
      require_js_module 'one'
      require_js_module :two

      modules_registry.should == ['one', 'two']
    end

    it "should skip duplicates" do
      require_js_module 'one'
      require_js_module :one

      modules_registry.should == ['one']
    end

    it "should accept several modules" do
      require_js_module 'one', 'two', 'two'
      modules_registry.should == ['one', 'two']
    end
  end

  describe ".required_js_files" do
    before :each do
      @config.swap_builds_and_sources = false
    end

    it "should include 'right' module first even when nothing set" do
      required_js_files.first.should == 'right'
    end

    it "should include the 'right/rails' module when config says so" do
      @config.include_rails_module = true
      required_js_files[1].should == 'right/rails'
    end

    it "should not include the 'right/rails' module if the config doesn't want it" do
      @config.include_rails_module = false
      required_js_files.should_not include('right/rails')
    end

    it "should add the registered modules" do
      require_js_module 'one', 'two'
      required_js_files.should == ['right', 'right/rails', 'right/one', 'right/two']
    end

    it "should swap to the source-files if config asks that and we are in the development-module" do
      @config.env = 'development'
      @config.swap_builds_and_sources = true
      required_js_files.should == ['right-src', 'right/rails-src']
    end

    it "should not swap to the source files in non-development environments" do
      @config.env = 'production'
      @config.swap_builds_and_sources = true
      required_js_files.should == ['right', 'right/rails']
    end

    it "should not include nothing but 'right' if config disabled auto-including" do
      @config.include_scripts_automatically = false
      require_js_module 'one', 'two'
      required_js_files.should == ['right']
    end

    it "should try to include locales when available" do
      I18n.should_receive(:locale).and_return('boo')
      @config.should_receive(:public_path).and_return('/public')
      @config.should_receive(:locales_path).and_return('/public/javascripts/right/i18n')
      File.should_receive(:exists?).with('/public/javascripts/right/i18n/boo.js').and_return(true)

      required_js_files.should == ['right', 'right/rails', 'right/i18n/boo']
    end

    it "should not include locales if there are not files for them" do
      I18n.should_receive(:locale).and_return('boo')
      @config.should_receive(:locales_path).and_return('/public/javascripts/right/i18n')
      File.should_receive(:exists?).with('/public/javascripts/right/i18n/boo.js').and_return(false)

      required_js_files.should == ['right', 'right/rails']
    end

    describe "with CDN option" do
      before :each do
        @config.env = 'production'
        @config.use_cdn_in_production = true
        @scripts_path = 'rails-root/public/javascripts'
      end

      def stub_file(name, content='')
        File.should_receive(:read).with("#{@scripts_path}/#{name}", 100).and_return(content)
      end

      it "should include RightJS core and plugins with CDN urls" do
        stub_file('right.js')
        stub_file('right/rails.js')
        stub_file('right/one.js')
        stub_file('right/two.js')

        require_js_module 'one', 'two'
        required_js_files.should == [
          "#{@config::DEFAULT_CDN_URL}/right.js",
          "#{@config::DEFAULT_CDN_URL}/plugins/rails.js",
          "#{@config::DEFAULT_CDN_URL}/plugins/one.js",
          "#{@config::DEFAULT_CDN_URL}/plugins/two.js"
        ]
      end

      it "should include urls with versions when available" do
        stub_file('right.js',       '/** some header v2.22.222')
        stub_file('right/rails.js', '/** some header v3.33.333')
        stub_file('right/one.js',   'no version in here')

        require_js_module 'one'
        required_js_files.should == [
          "#{@config::DEFAULT_CDN_URL}/right-2.22.222.js",
          "#{@config::DEFAULT_CDN_URL}/plugins/rails-3.33.333.js",
          "#{@config::DEFAULT_CDN_URL}/plugins/one.js"
        ]
      end

      it "should automatically distinct between plugins and UI modules" do
        stub_file('right.js',        'version 2.22.222 something')
        stub_file('right/rails.js',  'version 3.33.333 something')
        stub_file('right/widget.js', 'v4.44.444 see http://rightjs.org/ui/widget')

        require_js_module 'widget'
        required_js_files.should == [
          "#{@config::DEFAULT_CDN_URL}/right-2.22.222.js",
          "#{@config::DEFAULT_CDN_URL}/plugins/rails-3.33.333.js",
          "#{@config::DEFAULT_CDN_URL}/ui/widget-4.44.444.js"
        ]
      end

      it "should correctly refer the i18n modules" do
        I18n.should_receive(:locale).and_return('boo')
        File.should_receive(:exists?).with("#{@scripts_path}/right/i18n/boo.js").and_return(true)

        stub_file('right.js')
        stub_file('right/rails.js')
        stub_file('right/i18n/boo.js')

        required_js_files.should == [
          "#{@config::DEFAULT_CDN_URL}/right.js",
          "#{@config::DEFAULT_CDN_URL}/plugins/rails.js",
          "#{@config::DEFAULT_CDN_URL}/i18n/boo.js"
        ]
      end

      it "should use different cdn-url when asked" do
        stub_file('right.js')
        stub_file('right/rails.js')

        @config.cdn_url = 'http://some.url/dir'
        required_js_files.should == [
          'http://some.url/dir/right.js',
          'http://some.url/dir/plugins/rails.js'
        ]
      end
    end
  end
end