#
# Copies all the javascripts in place and updates them if necessary
#

class RightRailsGenerator < Rails::Generator::Base
  
  def manifest
    source_path      = File.dirname(__FILE__)
    images_path      = "#{source_path}/../../public/images"
    javascripts_path = "#{source_path}/../../public/javascripts"
    
    record do |m|
      # creating the javascript directories
      m.directory 'public/javascripts/right'
      m.directory 'public/javascripts/right/i18n'
      
      Dir["#{javascripts_path}/**/*.js"].each do |filename|
        m.file(
          filename.gsub("#{javascripts_path}/", "../../../public/javascripts/"),
          "public/javascripts/#{filename.gsub("#{javascripts_path}/", '')}",
          :chmod => 0644
        )
      end
      
      # creating the iframed uploads layout
      m.file "iframed.html.erb", "app/views/layouts/iframed.html.erb"
      
      # copying the images in place
      m.directory "public/images/rightjs-ui"
      
      Dir["#{images_path}/*"].each do |filename|
        m.file(
          filename.gsub("#{images_path}/", "../../../public/images/"),
          "public/images/rightjs-ui/#{filename.gsub("#{images_path}/", '')}",
          :chmod => 0644
        )
      end
    end
  end
  
  
  def banner
    "Usage: #{$0} right_rails"
  end
  
end