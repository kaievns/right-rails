#
# The plugin/gem is named with the dash symbol, but auto-resolving
# feature will be looking for an underscored file. Plus we need to hook
# up the initialization script too. So this is just a nasty trick
# to make it automatically initialized when you include the plugin as
# a gem in your environment.rb without the actual lib option specification
#
# Copyright (C) 2009 Nikolay V. Nemshilov aka St.
#
require 'right_rails'
require File.dirname(__FILE__) + '/../init.rb'