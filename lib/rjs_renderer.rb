#
# RJS handler was kicked out of Rails 3.1 along with Prototype
# so, here is a little substitute coz we use it here and there
#
module ActionView
  module Template::Handlers
    class RJS
      # Default format used by RJS.
      class_attribute :default_format
      self.default_format = Mime::JS

      def call(template)
        "update_page do |page|;#{template.source}\nend"
      end
    end
  end
end

ActiveSupport.on_load(:action_view) do
  ActionView::Base.class_eval do
    cattr_accessor :debug_rjs
    self.debug_rjs = false
  end

  ActionView::Template.register_template_handler :rjs, ActionView::Template::Handlers::RJS.new
end
