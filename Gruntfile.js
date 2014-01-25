module.exports = function(grunt) {
  grunt.initConfig({
    copy: {
      www: {
        files: [
          {
            'dist/index.html': 'www/index.html'
          },
          {
            expand: true,
            cwd: 'www',
            src: ['image/**/*', 'json/**/*', 'sound/**/*'],
            dest: 'dist'
          }
        ]
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
        files: ['vendor/**/*', 'src/**/*', 'dist/tmp/jst.js'],
        tasks: ['webpack']
      },
      www: {
        files: [
          'www/index.html',
          'www/image/**/*',
          'www/json/**/*',
          'www/sound/**/*'
        ],
        tasks: ['copy']
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
            'jst': '../dist/tmp/jst.js',
            'cloak-client': '../node_modules/cloak/cloak-client.min.js',
            'pixi': '../bower_components/pixi/bin/pixi.dev.js'
          }
        },
        module: {
          // lodash, when, and box2dweb dependencies do not need to be parsed
          // for require(...). This will make webpack-ing faster.
          noParse: /(lodash|vendor\/box2dweb|when|cloak-client|pixi\.dev)\.js$/
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
