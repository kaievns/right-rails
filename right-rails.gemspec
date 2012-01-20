Gem::Specification.new do |s|
  s.name    = 'right-rails'
  s.version = '1.3.1'
  s.date    = '2012-01-20'

  s.summary = "RightJS plugin for Rails"
  s.description = "RightRails is a RubyOnRails plugin for the RightJS JavaScript framework. "\
    "It has transparent Prototype helpers replacement, a new RJS generator, "\
    "the most common ajax operations interface and RightJS own features support "\
    "like remote files uploading handler, UI, plugins, etc."

  s.authors  = ['Nikolay Nemshilov']
  s.email    = 'nemshilov@gmail.com'
  s.homepage = 'http://github.com/MadRabbit/right-rails'

  s.files = Dir['generators/**/*'] + Dir['public/**/*'] + Dir['vendor/**/*'] + Dir['lib/**/*'] + Dir['spec/**/*']
  s.files+= %w(
    README.rdoc
    CHANGELOG
    MIT-LICENSE
    Rakefile
    init.rb
  )
end