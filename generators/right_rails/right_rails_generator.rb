#
# Copies all the javascripts in place and updates them if necessary
#

class RightRailsGenerator < Rails::Generator::Base
  
  mandatory_options :source => "#{File.dirname(__FILE__)}/../../javascripts"
    
  def manifest
    record do |m|
      # creating the javascript directories
      m.directory 'public/javascripts/right'
      m.directory 'public/javascripts/right/i18n'
      
      # copying the javascript files
      Dir.open(options[:source]).each do |file|
        unless ['.', '..'].include?(file)
          destination = if ['right.js', 'right-src.js', 'right-olds.js', 'right-olds-src.js'].include?(file)
            file
          elsif file.include?('ui-i18n')
            file.gsub('right-', 'right/').gsub('ui-i18n-', 'i18n/')
          else
            file.gsub('right-', 'right/')
          end
          
          m.file file, "public/javascripts/#{destination}", :chmod => 0644
        end
      end
      
      # creating the iframed uploads layout
      m.directory "app/views/layouts"
      m.file "/../generators/right_rails/templates/iframed.html.erb", "app/views/layouts/iframed.html.erb"
      
      # copying the images in place
      m.directory "public/images/rightjs-ui"
      Dir.open("#{File.dirname(__FILE__)}/../../images").each do |filename|
        unless ['.', '..'].include?(filename)
          m.file "/../images/#{filename}", "public/images/rightjs-ui/#{filename}"
        end
      end
    end
  end
  
  
  def banner
    "Usage: #{$0} right_rails"
  end
  
end