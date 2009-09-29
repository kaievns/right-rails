#
# This is pretty much the same thing as the native rails scaffold generator
# only without tests, plust it adds the '.js' format responses and fixes
# the templates organization
#
#
class RightScaffoldGenerator < ScaffoldGenerator
  def manifest
    record do |m|
      # Check for class naming collisions.
      m.class_collisions("#{controller_class_name}Controller", "#{controller_class_name}Helper")
      m.class_collisions(class_name)

      # Controller, helper, views, test and stylesheets directories.
      m.directory(File.join('app/models', class_path))
      m.directory(File.join('app/controllers', controller_class_path))
      m.directory(File.join('app/helpers', controller_class_path))
      m.directory(File.join('app/views', controller_class_path, controller_file_name))
      m.directory(File.join('app/views/layouts', controller_class_path))
      m.directory(File.join('public/stylesheets', class_path))

      for action in scaffold_views
        m.template(
          "view_#{action}.html.erb",
          File.join('app/views', controller_class_path, controller_file_name, "#{action}.html.erb")
        )
      end
      
      m.template "view__form.html.erb", File.join('app/views', controller_class_path, controller_file_name, "_form.html.erb")
      m.template "view__item.html.erb", File.join('app/views', controller_class_path, controller_file_name, "_#{file_name}.html.erb")

      # Layout and stylesheet.
      m.template('layout.html.erb', File.join('app/views/layouts', controller_class_path, "#{controller_file_name}.html.erb"))
      m.template('style.css', 'public/stylesheets/scaffold.css')

      m.template(
        'controller.rb', File.join('app/controllers', controller_class_path, "#{controller_file_name}_controller.rb")
      )

      m.template('helper.rb',          File.join('app/helpers',     controller_class_path, "#{controller_file_name}_helper.rb"))
      
      m.route_resources controller_file_name

      m.dependency 'model', [name] + @args, :collision => :skip
    end
  end
  
protected

  def banner
    "Usage: #{$0} right_scaffold ModelName [field:type, field:type]"
  end
end
