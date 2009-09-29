#
# Copies all the javascripts in place and updates them if necessary
#

class RightRailsGenerator < Rails::Generator::Base
  
  mandatory_options :source => "#{File.dirname(__FILE__)}/../../javascripts"
    
  def manifest
    record do |m|
      m.directory 'public/javascripts/right'
      m.directory 'public/javascripts/right/i18n'
      
      Dir.open(options[:source]).each do |file|
        unless ['.', '..'].include?(file)
          destination = if ['right.js', 'right-src.js'].include?(file)
            file
          elsif file.include?('ui-i18n')
            file.gsub('right-', 'right/').gsub('ui-i18n-', 'i18n/')
          else
            file.gsub('right-', 'right/')
          end
          
          m.file file, "public/javascripts/#{destination}", :chmod => 644
        end
      end
    end
  end
  
  
  def banner
    "Usage: #{$0} right_rails"
  end
  
end