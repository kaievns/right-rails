require 'rake'
require 'rake/testtask'
require 'rake/rdoctask'
require 'spec/rake/spectask'

desc 'Default: run rspec tests.'
task :default => :spec

desc "Run all specs in spec directory"
Spec::Rake::SpecTask.new(:spec) do |t|
  t.spec_opts = ['--options', "spec/spec.opts"]
  t.spec_files = FileList['spec/**/*_spec.rb']
end

namespace :spec do
  desc "Run all specs in spec directory with RCov"
  Spec::Rake::SpecTask.new(:rcov) do |t|
    t.spec_opts = ['--options', "spec/spec.opts"]
    t.spec_files = FileList['spec/**/*_spec.rb']
    t.rcov = true
    t.rcov_dir = 'coverage'
    t.rcov_opts = lambda do
      IO.readlines("spec/rcov.opts").map {|l| l.chomp.split " "}.flatten
    end
  end

#  desc "Print Specdoc for all specs"
#  Spec::Rake::SpecTask.new(:doc) do |t|
#    t.spec_opts = ["--format", "specdoc", "--dry-run"]
#    t.spec_files = FileList['spec/**/*_spec.rb']
#  end
end

desc 'Generate documentation for the right_rails plugin.'
Rake::RDocTask.new(:rdoc) do |rdoc|
  rdoc.rdoc_dir = 'rdoc'
  rdoc.title    = 'RightRails'
  rdoc.options << '--line-numbers' << '--inline-source'
#  rdoc.rdoc_files.include('README')
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
