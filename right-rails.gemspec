Gem::Specification.new do |s|
  s.name    = 'right-rails'
  s.version = '1.0.0'
  s.date    = '2010-09-04'
  
  s.summary = "RightJS plugin for Rails"
  s.description = "RightRails is a RubyOnRails plugin for the RightJS JavaScript framework. "\
    "It has transparent Prototype helpers replacement, plus there is a new RJS generator, "\
    "the most common ajax operations interface, RightJS own features support, remote files uploading handler, etc."
  
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
    README.textile
    CHANGELOG
    MIT-LICENSE
    Rakefile
    init.rb
  )
end