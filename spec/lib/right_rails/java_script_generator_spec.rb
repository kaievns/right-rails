require File.dirname(__FILE__) + "/../../spec_helper.rb"

module ActiveRecord
  class Base
    def initialize(hash)
      @hash = hash
    end
    
    def id
      @hash[:id]
    end
  end
end

module ActiveResource
  class Base
  end
end

describe RightRails::JavaScriptGenerator do
  before :each do
    @template = mock()
    def @template.dom_id(record) "record_#{record.id}" end
    def @template.escape_javascript(str) str end
    
    @page = RightRails::JavaScriptGenerator.new(@template)
  end
  
  describe "top level calls" do
    it "should generate a simple ID search" do
      @page['element-id']
      @page.to_s.should == '$("element-id");'
    end
    
    it "should respond to the top-level javascript objects" do
      @page.document
      @page.to_s.should == 'document;'
    end

    it "should generate an ID search from active-records and active-resources" do
      @record = ActiveRecord::Base.new({:id => '22'})
      @page[@record]
      @page.to_s.should == '$("record_22");'
    end
    
    it "should process << pushes correctly" do
      @page << 'some_code();' << 'another_code();'
      @page.to_s.should == 'some_code();another_code();'
    end
    
    it "should convert several lines of code properly" do
      @page['el1'].update('text1').show();
      @page['el2'].update('text2').highlight();
      
      @page.to_s.should == '$("el1").update("text1").show();$("el2").update("text2").highlight();'
    end
  end
  
  describe "second level calls" do
    it "should catch up an element method simple calls" do
      @page['element-id'].myMethod
      @page.to_s.should == '$("element-id").myMethod();'
    end

    it "should catch up an element method arguments as well" do
      @page['element-id'].myMethod(1,2,3)
      @page.to_s.should == '$("element-id").myMethod(1,2,3);'
    end

    it "should catch up with element property calls" do
      @page['element-id'][:innerHTML]
      @page.to_s.should == '$("element-id").innerHTML;'
    end

    it "should catch up with element properties call chains" do
      @page['element-id'].test(1).show.highlight()
      @page.to_s.should == '$("element-id").test(1).show().highlight();'
    end
  end
  
  describe "data types conversion" do
    it "should correctly process numeric arguments" do
      @page['element-id'].test(1, 2.3)
      @page.to_s.should == '$("element-id").test(1,2.3);'
    end

    it "should correctly process boolean and nil values" do
      @page["element-id"].test(true, false, nil)
      @page.to_s.should == '$("element-id").test(true,false,null);'
    end

    it "should escape string arguments properly" do
      @template.should_receive(:escape_javascript).with('"quoted"').and_return('_quoted_')
      @page["element-id"].test('"quoted"')
      @page.to_s.should == '$("element-id").test("_quoted_");'
    end

    it "should convert symbols into object reverences" do
      @page["element-id"].test(:name1, :name2, :name3)
      @page.to_s.should == '$("element-id").test(name1,name2,name3);'
    end

    it "should handle arrays properly" do
      @template.should_receive(:escape_javascript).with('"quoted"').and_return('_quoted_')

      @page["element-id"].test([1,2.3,[nil,[true,'"quoted"']]])
      @page.to_s.should == '$("element-id").test([1,2.3,[null,[true,"_quoted_"]]]);'
    end

    it "should handle hashes properly" do
      @page["element-id"].test({
        :one => 1,
        :two => 2.3,
        'four' => {
          'five' => true,
          'six'  => nil
        }
      })
      @page.to_s.should == '$("element-id").test({"four":{"five":true,"six":null},one:1,two:2.3});'
    end
    
    it "should handle JSON exportable units too" do
      @value = ActiveRecord::Base.new({:id => '22'});
      def @value.to_json
        {:id => id}
      end
      
      @page["element-id"].test(@value)
      @page.to_s.should == '$("element-id").test({id:"22"});'
    end
  end
  
  
end