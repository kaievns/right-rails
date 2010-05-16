require 'rake'
require 'rake/testtask'
require 'rake/rdoctask'

desc 'Default: run unit tests.'
task :default => :test

desc 'Test the right_rails plugin.'
Rake::TestTask.new(:test) do |t|
  t.libs << 'lib'
  t.libs << 'test'
  t.pattern = 'test/**/*_test.rb'
  t.verbose = true
end

desc 'Generate documentation for the right_rails plugin.'
Rake::RDocTask.new(:rdoc) do |rdoc|
  rdoc.rdoc_dir = 'rdoc'
  rdoc.title    = 'RightRails'
  rdoc.options << '--line-numbers' << '--inline-source'
  rdoc.rdoc_files.include('README')
  rdoc.rdoc_files.include('lib/**/*.rb')
end


namespace :rjs do
  desc 'Patches the JavaScript UI modules for new images location'
  task :patch_ui do
    FileList['javascripts/*.js'].each do |filename|
      old_content = File.read(filename)
      new_content = old_content.gsub('url(../../img/', "url(/images/rightjs-ui/")
      new_content = new_content.gsub(/([^\s])no-repeat/, '\1 no-repeat') # front-compiler CSS compressor bug fix
      
      if old_content != new_content
        puts "Patching: #{filename}"
        File.open(filename, "w") do |f|
          f.write new_content
        end
      end
    end
  end
end
