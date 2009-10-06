require File.dirname(__FILE__) + "/../../spec_helper.rb"

#
# Fake active-record and active resource classes to work with
#
module ActiveRecord
  class Base
    def initialize(hash)
      @hash = hash
    end
    
    def id
      @hash[:id]
    end
    
    def self.table_name
      name = 'records'
      name.stub!(:singularize).and_return('record')
      name
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
    
    it "should generate a CSS select block" do
      @page.find('div, span, table')
      @page.to_s.should == '$$("div, span, table");'
    end
    
    it "should process assignments" do
      @page.something = nil;
      @page.to_s.should == 'something=null;'
    end
    
    it "should generate redirect" do
      @page.redirect_to('/boo/boo/boo')
      @page.to_s.should == 'window.location.href="/boo/boo/boo";'
    end
    
    it "should generate reload" do
      @page.reload
      @page.to_s.should == 'window.location.reload();'
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
  
  describe "RR object method calls generator" do
    before :each do
      @record = ActiveRecord::Base.new({:id => '22'})
    end
    
    it "should generate script for the 'insert' request" do
      @template.should_receive(:render).with(@record, anything).and_return('<record html code/>')
      
      @page.rr.insert(@record)
      @page.to_s.should == 'RR.insert("records","<record html code/>");'
    end
    
    it "should generate script for the 'replace' request" do
      @template.should_receive(:render).with(@record, anything).and_return('<record html code/>')
      
      @page.rr.replace(@record)
      @page.to_s.should == 'RR.replace("record_22","<record html code/>");'
    end
    
    it "should generate script for the 'remove' request" do
      @page.rr.remove(@record)
      @page.to_s.should == 'RR.remove("record_22");'
    end
    
    it "should generate script for the 'show_form_for' request" do
      @template.should_receive(:render).with('form', anything).and_return('<the form html code/>')
      
      @page.rr.show_form_for(@record)
      @page.to_s.should == 'RR.show_form_for("record_22","<the form html code/>");'
    end
    
    describe "replace_form_for generator" do
      before :each do
        @template.should_receive(:render).with('form', anything).and_return('<the form html code/>')
      end
      
      it "should generate a script for a new record" do
        @record.should_receive(:new_record?).and_return(true)

        @page.rr.replace_form_for(@record)
        @page.to_s.should == 'RR.replace_form_for("new_record","<the form html code/>");'
      end
      
      it "should generate a script for an existing record" do
        @record.should_receive(:new_record?).and_return(false)

        @page.rr.replace_form_for(@record)
        @page.to_s.should == 'RR.replace_form_for("edit_record_22","<the form html code/>");'
      end
    end
    
    it "should generate redirection" do
      @template.should_receive(:url_for).with({:the => options}).and_return('/the/url')
      
      @page.rr.redirect_to({:the => options})
      @page.to_s.should == 'window.location.href="/the/url";'
    end
    
    it "should generate redirection" do
      @page.rr.reload
      @page.to_s.should == 'window.location.reload();'
    end
  end
  
  
end