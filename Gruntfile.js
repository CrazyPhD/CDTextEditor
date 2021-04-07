module.exports = function(grunt) {

    grunt.initConfig({
      pkg: grunt.file.readJSON('package.json'),
      
      jshint: {
          cdtexteditor: ['src/cdtexteditor/cdtexteditor.js']
      },

      csslint: {
          cdtexteditor: {
              src: ['src/cdtexteditor/cdtexteditor.css']
          }
      },

      concat: {
        js: {
            options: {
                banner: "'use strict';\n",
                process: function(src, filepath) {
                return '// Source: ' + filepath + '\n' +
                    src.replace(/(^|\n)[ \t]*('use strict'|"use strict");?\s*/g, '$1');
                }
            },
            src: [
                "src/codemirror/codemirror.js",
                "src/codemirror/mode/markdown/markdown.js",
                "src/codemirror/addon/hint/show-hint.js",
                "src/showdown-1.9.1/showdown.js",
                "src/typo/typo.js",
                "src/cdtexteditor/cdtexteditor.js",
            ],
            dest: 'build/<%= pkg.name %>.js'
        },
        css: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            src: [
                "src/codemirror/codemirror.css",
                "src/codemirror/addon/hint/show-hint.css",
                "src/cdtexteditor/cdtexteditor.css"
              ],
            dest: 'build/<%= pkg.name %>.css'
        }
      },
      
      uglify: {
        options: {
            banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
        },
        js: {
            src: 'build/<%= pkg.name %>.js',
            dest: 'dist/<%= pkg.name %>.min.js'
        }
      },

      cssmin: {
          options: {
            banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
          },
          target: {
            src: 'build/<%= pkg.name %>.css',
            dest: 'dist/<%= pkg.name %>.min.css'
          }
      },

      clean: ['build'],

      copy: {
          assets: {
              expand: true,
              cwd: 'src/cdtexteditor/assets/',
              src: ['**'],
              dest: 'dist/assets/'
          }
      }
    });
  
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-csslint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-copy');

    
    grunt.registerTask('lint', ['jshint', 'csslint']);
    grunt.registerTask('default', ['jshint', 'csslint', 'concat', 'uglify', 'cssmin', 'copy', 'clean'])
    grunt.registerTask('build', ['concat', 'uglify', 'cssmin', 'copy', 'clean']);
  
  };