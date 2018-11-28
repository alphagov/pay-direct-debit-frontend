const path = require('path')
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
    assets: {
      files: ['common/assets/**/*', '!common/assets/sass/**'],
      tasks: ['copy:assets'],
      options: {
        spawn: false
      }
    }
  }

  const browserify = {
    'public/javascripts/browsered.js': ['common/browsered/index.js'],
    options: {
      browserifyOptions: { standalone: 'module' },
      transform: [
        [
          'babelify',
          {
            presets: ['es2015']
          }
        ],
        [
          'nunjucksify',
          {
            extension: '.njk'
          }
        ]
      ]
    }
  }

  const concat = {
    options: {
      separator: ';'
    },
    dist: {
      src: [
        'public/javascripts/browsered.js',
        'common/assets/javascripts/base/*.js',
        'common/assets/javascripts/modules/*.js'
      ],
      dest: 'public/javascripts/application.js'
    }
  }

  const rewrite = {
    'application.min.css': {
      src: 'public/stylesheets/application.min.css',
      editor: function (contents) {
        const staticify = require('staticify')(path.join(__dirname, 'public'))
        return staticify.replacePaths(contents)
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
    clean: ['public', 'govuk_modules'],
    sass,
    copy,
    watch,
    browserify,
    concat,
    rewrite,
    compress
  });

  [
    'grunt-contrib-copy',
    'grunt-contrib-compress',
    'grunt-contrib-watch',
    'grunt-contrib-clean',
    'grunt-sass',
    'grunt-browserify',
    'grunt-contrib-concat',
    'grunt-rewrite'
  ].forEach(task => grunt.loadNpmTasks(task))

  grunt.registerTask('generate-assets', [
    'clean',
    'copy',
    'sass',
    'browserify',
    'concat',
    'rewrite',
    'compress'
  ])

  grunt.registerTask('default', [
    'watch'
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
