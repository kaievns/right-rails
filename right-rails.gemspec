Gem::Specification.new do |s|
  s.name    = 'right-rails'
  s.version = '1.0.6'
  s.date    = '2010-09-21'

  s.summary = "RightJS plugin for Rails"
  s.description = "RightRails is a RubyOnRails plugin for the RightJS JavaScript framework. "\
    "It has transparent Prototype helpers replacement, a new RJS generator, "\
    "the most common ajax operations interface and RightJS own features support "\
    "like remote files uploading handler, UI, plugins, etc."

  s.authors  = ['Nikolay Nemshilov']
  s.email    = 'nemshilov@gmail.com'
  s.homepage = 'http://github.com/MadRabbit/right-rails'

  s.post_install_message = %Q{
<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< RIGHT RAILS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

  Please run the following command to copy RightJS scripts and modules in place

  script/generate right_rails

  \e[5m\e[31mNOTE\e[0m\e[0m: will copy over the RightJS 2.0 files!!!

<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< RIGHT RAILS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
}


  s.files = Dir['generators/**/*'] + Dir['public/**/*'] + Dir['lib/**/*'] + Dir['spec/**/*']
  s.files+= %w(
    README.rdoc
    CHANGELOG
    MIT-LICENSE
    Rakefile
    init.rb
  )
end