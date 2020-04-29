const nodeSass = require('node-sass')

module.exports = function (grunt) {
  const sass = {
    dev: {
      options: {
        implementation: nodeSass,
        style: 'expanded',
        sourcemap: true,
        includePaths: [
          'node_modules'
        ],
        outputStyle: 'compressed'
      },
      files: [{
        expand: true,
        cwd: 'common/assets/sass',
        src: ['*.scss', 'custom/*.scss'],
        dest: 'public/stylesheets/',
        ext: '.min.css'
      }]
    }
  }

  const copy = {
    assets: {
      files: [
        {
          expand: true,
          cwd: 'common/assets/',
          src: ['**/*', '!sass/**'],
          dest: 'public/'
        }
      ]
    }
  }

  const watch = {
    css: {
      files: ['common/assets/sass/**/*.scss'],
      tasks: ['sass'],
      options: {
        spawn: false,
        livereload: true
      }
    },
    js: {
      files: ['common/browsered/**/*.js'],
      tasks: ['browserify', 'babel'],
      options: {
        spawn: false,
        livereload: true
      }
    },
    templates: {
      files: ['app/**/*.njk', 'common/**/*.njk'],
      options: {
        spawn: false,
        livereload: true
      }
    },
    assets: {
      files: ['common/assets/**/*', '!common/assets/sass/**'],
      tasks: ['copy:assets'],
      options: {
        spawn: false
      }
    }
  }

  const browserify = {
    'public/javascripts/application.js': ['common/browsered/index.js'],
    options: {
      browserifyOptions: { standalone: 'module' },
      transform: [
        [
          'nunjucksify',
          {
            extension: '.njk'
          }
        ]
      ]
    }
  }

  const babel = {
    options: {
      presets: ['@babel/preset-env'],
      compact: false
    },
    dist: {
      files: {
        'public/javascripts/application.js': 'public/javascripts/application.js'
      }
    }
  }

  const uglify = {
    my_target: {
      files: {
        'public/javascripts/application.min.js': ['public/javascripts/application.js']
      }
    }
  }

  const compress = {
    main: {
      options: {
        mode: 'gzip'
      },
      files: [
        { expand: true, src: ['public/images/*.jpg'], ext: '.jpg.gz' },
        { expand: true, src: ['public/images/*.gif'], ext: '.gif.gz' },
        { expand: true, src: ['public/images/*.png'], ext: '.png.gz' },
        { expand: true, src: ['public/javascripts/*.js'], ext: '.js.gz' },
        { expand: true, src: ['public/stylesheets/*.css'], ext: '.css.gz' }
      ]
    }
  }

  grunt.initConfig({
    clean: ['public'],
    sass,
    copy,
    watch,
    browserify,
    babel,
    uglify,
    compress
  });

  [
    'grunt-babel',
    'grunt-browserify',
    'grunt-contrib-clean',
    'grunt-contrib-compress',
    'grunt-contrib-copy',
    'grunt-contrib-uglify',
    'grunt-contrib-watch',
    'grunt-sass'
  ].forEach(task => grunt.loadNpmTasks(task))

  grunt.registerTask('generate-assets', [
    'clean',
    'copy',
    'sass',
    'browserify',
    'babel',
    'uglify',
    'compress'
  ])

  grunt.registerTask('default', [
    'generate-assets'
  ])

  /**
   * On watch, copy the asset that was changed, not all of them
   */
  grunt.event.on('watch', function (action, filepath, target) {
    if (target === 'assets') {
      grunt.config(
        'copy.assets.files.0.src',
        filepath.replace('common/assets/', '')
      )
    }
  })
}
