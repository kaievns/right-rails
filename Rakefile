require 'rake'
require 'rake/rdoctask'
require 'rspec/core/rake_task'

desc 'Default: run rspec tests.'
task :default => :spec

desc "Run all specs in spec directory"
RSpec::Core::RakeTask.new(:spec) do |t|
  t.rspec_opts = ['--options', "spec/spec.opts"]
  t.pattern    = 'spec/**/*_spec.rb'
end

namespace :spec do
  desc "Run all specs in spec directory with RCov"
  RSpec::Core::RakeTask.new(:rcov) do |t|
    t.rspec_opts = ['--options', "spec/spec.opts"]
    t.pattern    = 'spec/**/*_spec.rb'
    t.rcov       = true
    t.rcov_opts  = lambda do
      IO.readlines("spec/rcov.opts").map {|l| l.chomp.split " "}.flatten
    end
  end
end

desc 'Generate documentation for the right_rails plugin.'
Rake::RDocTask.new(:rdoc) do |rdoc|
  rdoc.rdoc_dir = 'rdoc'
  rdoc.title    = 'RightRails'
  rdoc.options << '--line-numbers' << '--inline-source'
  rdoc.rdoc_files.include('README.rdoc')
  rdoc.rdoc_files.include('lib/**/*.rb')
end


#
# Some of my own scripts to help me build the RightJS stuff
# and properly organize it in the directory that will be
# used in the Rails generator
#
namespace :rjs do
  CURRENT_DIR         = File.dirname(__FILE__)

  OUTPUT_DIR          = CURRENT_DIR + '/public'
  OUTPUT_JSS_DIR      = OUTPUT_DIR + "/javascripts"
  OUTPUT_IMG_DIR      = OUTPUT_DIR + "/images/rightjs-ui"

  RIGHTJS_CORE_DIR    = CURRENT_DIR + '/../RightJS'
  RIGHTJS_PLUGINS_DIR = CURRENT_DIR + '/../RightJSPlugins'
  RIGHTJS_UI_DIR      = CURRENT_DIR + '/../RightJSUI'

  desc 'Builds all the RightJS files and tosses them into the directories'
  task :build do
    Rake::Task['rjs:nuke'].invoke
    Rake::Task['rjs:build:core'].invoke
    Rake::Task['rjs:build:plugins'].invoke
    Rake::Task['rjs:build:ui'].invoke
    Rake::Task['rjs:patch'].invoke
    Rake::Task['rjs:i18n'].invoke
    Rake::Task['rjs:toss'].invoke
  end

  desc 'Nukes the RightJS sources directory'
  task :nuke do
    require 'fileutils'

    puts "\e[31m<<<<<<<<<<<<<     TERMAL CLEANING     >>>>>>>>>>>>>>>>>\e[0m"

    FileUtils.rm_rf   OUTPUT_DIR if File.exists? OUTPUT_DIR
    FileUtils.mkdir_p OUTPUT_DIR
    FileUtils.mkdir_p OUTPUT_IMG_DIR
    FileUtils.mkdir_p OUTPUT_JSS_DIR
    FileUtils.mkdir_p OUTPUT_JSS_DIR + "/right"

    puts "\e[32mDONE \e[0m"
  end

  desc 'Builds RightJS core and copies them in place'
  task :'build:core' do
    puts "\e[31m<<<<<<<<<<<<     BUILDING THE CORE     >>>>>>>>>>>>>>>>\e[0m"

    system(%Q{
      cd #{RIGHTJS_CORE_DIR};
      nake build OPTIONS=no-olds;
      cp build/*.js #{OUTPUT_JSS_DIR};
      nake build OPTIONS=safe;
      cp build/right-safe*.js #{OUTPUT_JSS_DIR};
    })

    puts "\e[32mDONE \e[0m"
  end

  desc 'Builds RightJS plugins and copies them in place'
  task :'build:plugins' do
    puts "\e[31m<<<<<<<<<<<<<    BUILDING PLUGINS     >>>>>>>>>>>>>>>>>\e[0m"

    system(%Q{
      cd #{RIGHTJS_PLUGINS_DIR};
      nake build;
      cp build/*.js #{OUTPUT_JSS_DIR}/right;
    })

    puts "\e[32mDONE \e[0m"
  end

  desc 'Builds RightJS UI modules and copies them in place'
  task :'build:ui' do
    puts "\e[31m<<<<<<<<<<<     BUILDING UI MODULES     >>>>>>>>>>>>>>>\e[0m"

    system(%Q{
      cd #{RIGHTJS_UI_DIR};
      nake build;
      cp build/*.js #{OUTPUT_JSS_DIR}/right;
    })

    system(%Q{
      cd #{RIGHTJS_UI_DIR};
      cp img/* #{OUTPUT_IMG_DIR};
    })

    puts "\e[32mDONE \e[0m"
  end

  desc 'Patches the RightJS UI modules for the Rails directories structure'
  task :'patch' do
    puts "\e[31m<<<<<<<     PATCHING UI MODULES FOR RAILS     >>>>>>>>>\e[0m"

    FileList["#{OUTPUT_JSS_DIR}/right/*.js"].each do |filename|
      old_content = File.read(filename)
      new_content = old_content.gsub('url(../../img/', "url(/images/rightjs-ui/")

      if old_content != new_content
        puts "Patching: #{File.basename(filename)}"
        File.open(filename, "w") do |f|
          f.write new_content
        end
      end
    end

    puts "\e[32mDONE \e[0m"
  end

  desc 'Copies the RightJS UI i18n modules in place'
  task :i18n do
    puts "\e[31m<<<<<<<<<<<     COPYING I18N MODULES     >>>>>>>>>>>>>>\e[0m"

    system(%Q{
      cp -r #{RIGHTJS_UI_DIR}/i18n #{OUTPUT_JSS_DIR}/right;
    })

    puts "\e[32mDONE \e[0m"
  end

  desc 'Prepares the files as they will be placed in Rails'
  task :toss do
    puts "\e[31m<<<<<<<<<     PREPARING FILES FOR RAILS     >>>>>>>>>>>\e[0m"

    FileList["#{OUTPUT_JSS_DIR}/right/right-*.js"].each do |filename|
      system "mv #{filename.gsub('/right/right-', '/right/{right-,}')}"
    end

    puts "\e[32mDONE \e[0m"
  end
end
