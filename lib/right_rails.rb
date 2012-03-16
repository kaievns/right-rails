#
# The RightRails module. Just a namespace
#
module RightRails
  VERSION = '1.3.2'

  autoload :Config,               'right_rails/config'
  autoload :JavaScriptGenerator,  'right_rails/java_script_generator'
  autoload :ControllerExtensions, 'right_rails/controller_extensions'
  autoload :Helpers,              'right_rails/helpers'
end
