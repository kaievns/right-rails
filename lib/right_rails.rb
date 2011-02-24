#
# The RightRails module. Just a namespace
#
module RightRails
  VERSION = '1.0.11'

  autoload :Config,               'right_rails/config'
  autoload :JavaScriptGenerator,  'right_rails/java_script_generator'
  autoload :ControllerExtensions, 'right_rails/controller_extensions'
  autoload :Helpers,              'right_rails/helpers'
end
