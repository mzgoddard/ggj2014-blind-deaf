module.exports = function(grunt) {
  grunt.initConfig({
    copy: {
      index: {
        files: {
          'dist/index.html': 'www/index.html'
        }
      }
    },

    handlebars: {
      jst: {
        files: {
          'dist/tmp/jst.js': 'www/html/**/*.hbs'
        }
      }
    },

    jshint: {
      src: ['src/**/*.js']
    },

    stylus: {
      css: {
        files: {
          'dist/index.css': ['www/css/index.css']
        }
      }
    },

    watch: {
      css: {
        files: ['www/css/**/*'],
        tasks: ['stylus']
      },
      jst: {
        files: ['www/html/**/*'],
        tasks: ['handlebars']
      },
      src: {
        files: ['src/**/*', 'dist/tmp/jst.js'],
        tasks: ['webpack']
      }
    },

    webpack: {
      src: {
        entry: './src/index.js',
        output: {
          path: './dist/',
          filename: 'blinddeaf.js',
          sourceMapFilename: '[file].map'
        },
        devtool: 'source-map',
        resolve: {
          alias: {
            'box2dweb': '../vendor/box2dweb.js',
            'boxbox': '../vendor/boxbox.js',
            'jst': '../dist/tmp/jst.js'
          }
        },
        module: {
          // lodash, when, and box2dweb dependencies do not need to be parsed
          // for require(...). This will make webpack-ing faster.
          noParse: /(lodash|vendor\/box2dweb|when)\.js$/
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-handlebars');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-stylus');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-webpack');

  grunt.registerTask('default', ['copy', 'stylus', 'handlebars', 'webpack']);
  grunt.registerTask('test', ['jshint'])
};
