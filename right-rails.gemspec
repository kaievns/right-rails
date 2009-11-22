Gem::Specification.new do |s|
  s.name    = 'right-rails'
  s.version = '0.3.0'
  s.date    = '2009-11-22'
  
  s.summary = "RightJS plugin for Rails"
  s.description = "RightRails provides support of the RightJS framework for the native Rails/Prototype helpers, plus it has a new RJS processor, most common ajax operations interface, RightJS own feature support, remove files uploading handler, etc."
  
  s.authors  = ['Nikolay Nemshilov']
  s.email    = 'nemshilov@gmail.com'
  s.homepage = 'http://github.com/MadRabbit/right-rails'
  s.post_install_message = %q{
<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< RIGHT RAILS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

  Please run the following command to copy RightJS scripts and modules in place
  
  script/generate right_rails

  Cheers!
  
  }
  
  
  s.files = Dir['generators/**/*'] + Dir['javascripts/**/*'] + Dir['lib/**/*'] + Dir['spec/**/*']
  s.files+= %w(
    README.textile
    MIT-LICENSE
    Rakefile
    init.rb
  )
end