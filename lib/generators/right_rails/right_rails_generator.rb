#
# Copies all the javascripts in place and updates them if necessary
#
# Kudos to Jose Fernández (http://github.com/magec)
#
class RightRailsGenerator < Rails::Generators::Base
  
  def manifest
    source_path      = File.dirname(__FILE__)
    images_path      = "#{source_path}/../../../public/images"
    javascripts_path = "#{source_path}/../../../public/javascripts"

    # copying the javascript javascript files
    directory javascripts_path , "public/javascripts/"

    # creating the iframed uploads layout
    copy_file source_path + "/templates/iframed.html.erb", "app/views/layouts/iframed.html.erb"
    
    # copying the images in place
    directory images_path, "public/images/rightjs-ui"
  end
  
  def banner
    "Usage: #{$0} right_rails"
  end
  
end