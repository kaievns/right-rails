#
# Copies all the javascripts in place and updates them if necessary
#
# Kudos to Jose Fernández (http://github.com/magec)
#
class RightRailsGenerator < Rails::Generators::Base

  def manifest
    source_path      = File.dirname(__FILE__)
    images_path      = "#{source_path}/../../../vendor/assets/images/rightjs-ui"
    javascripts_path = "#{source_path}/../../../vendor/assets/javascripts"

    # copying the javascript javascript files
    directory javascripts_path , "public/javascripts"

    # copying the images in place
    directory images_path, "public/images/rightjs-ui"

    # patching up the JS files to use images from 'pubic/images'
    Dir['public/javascripts/right/*.js'].each do |filename|
      old_content = File.read(filename)
      new_content = old_content.gsub("url(/assets/rightjs-ui/", "url(/images/rightjs-ui/")

      if old_content != new_content
        File.open(filename, "w") do |f|
          f.write new_content
        end
      end
    end
  end

  def banner
    "Usage: #{$0} right_rails"
  end

end