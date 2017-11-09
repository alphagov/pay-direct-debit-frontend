const path = require('path')

module.exports = function (grunt) {
  const sass = {
    dev: {
      options: {
        style: 'expanded',
        sourcemap: true,
        includePaths: [
          'govuk_modules/govuk_template/assets/stylesheets',
          'govuk_modules/govuk_frontend_toolkit/stylesheets'
        ],
        outputStyle: 'expanded'
      },
      files: [{
        expand: true,
        cwd: 'app/assets/sass',
        src: ['*.scss', 'custom/*.scss'],
        dest: 'public/stylesheets/',
        ext: '.css'
      }]
    }
  }

  const copy = {
    assets: {
      files: [{
        expand: true,
        cwd: 'app/assets/images/',
        src: ['**', '**/*'],
        dest: 'public/images/'
      }]
    },
    govuk: {
      files: [{
        expand: true,
        cwd: 'node_modules/govuk_frontend_toolkit',
        src: '**',
        dest: 'govuk_modules/govuk_frontend_toolkit/'
      },
      {
        expand: true,
        cwd: 'node_modules/govuk-elements-sass',
        src: '**',
        dest: 'govuk_modules/govuk-elements-sass/'
      },
      {
        expand: true,
        cwd: 'node_modules/govuk_template_mustache/',
        src: '**',
        dest: 'govuk_modules/govuk_template/'
      }]
    }
  }

  const cssmin = {
    target: {
      files: {
        'public/stylesheets/application.min.css': [
          'public/stylesheets/application.css'
        ]
      }
    }
  }

  const replace = {
    fixSass: {
      src: ['govuk_modules/govuk_template/**/*.scss', 'govuk_modules/govuk_frontend_toolkit/**/*.scss'],
      overwrite: true,
      replacements: [{
        from: /filter:chroma(.*);/g,
        to: 'filter:unquote("chroma$1");'
      }]
    }
  }

  const watch = {
    css: {
      files: ['app/assets/sass/**/*.scss'],
      tasks: ['sass'],
      options: {
        spawn: false,
        livereload: true
      }
    },
    assets: {
      files: ['app/assets/**/*', '!app/assets/sass/**'],
      tasks: ['copy:assets'],
      options: {
        spawn: false
      }
    }
  }

  const browserify = {
    'public/javascripts/browsered.js': ['app/browsered.js'],
    options: {
      browserifyOptions: {
        standalone: 'module'
      },
      transform: [
        [
          'babelify',
          {
            presets: ['es2015']
          }
        ]
      ]
    }
  }

  const nodemon = {
    dev: {
      script: 'server.js',
      options: {
        ext: 'js',
        ignore: ['node_modules/**', 'app/assets/**', 'public/**'],
        args: ['-i=true']
      }
    }
  }

  const concurrent = {
    target: {
      tasks: ['watch', 'nodemon'],
      options: {
        logConcurrentOutput: true
      }
    }
  }

  const mochaTest = {
    run: {
      src: grunt.option('only')
        ? [grunt.option('only')]
        : ['test/**/*.js', '!test/test_helpers/*.js']
    },
    test: {
      options: {
        reporter: 'spec',
        captureFile: 'mocha-test-results.txt'
      }
    }
  }

  const env = {
    test: {
      src: 'config/test-env.json'
    }
  }

  const concat = {
    options: {
      separator: ';'
    },
    dist: {
      src: ['public/javascripts/browsered.js', 'app/assets/javascripts/base/*.js',
        'app/assets/javascripts/modules/*.js'],
      dest: 'public/javascripts/application.js'
    }
  }

  const rewrite = {
    'application.css': {
      src: 'public/stylesheets/application.css',
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
        {expand: true, src: ['public/images/*.jpg'], ext: '.jpg.gz'},
        {expand: true, src: ['public/images/*.gif'], ext: '.gif.gz'},
        {expand: true, src: ['public/images/*.png'], ext: '.png.gz'},
        {expand: true, src: ['public/javascripts/*.js'], ext: '.js.gz'},
        {expand: true, src: ['public/stylesheets/*.css'], ext: '.css.gz'}
      ]
    }
  }

  grunt.initConfig({
    clean: ['public', 'govuk_modules'],
    sass: sass,
    copy: copy,
    replace: replace,
    watch: watch,
    browserify: browserify,
    nodemon: nodemon,
    concurrent: concurrent,
    cssmin: cssmin,
    concat: concat,
    rewrite: rewrite,
    compress: compress,
    mochaTest: mochaTest,
    env: env
  });

  [
    'grunt-contrib-copy',
    'grunt-contrib-cssmin',
    'grunt-contrib-compress',
    'grunt-contrib-watch',
    'grunt-contrib-clean',
    'grunt-sass',
    'grunt-nodemon',
    'grunt-text-replace',
    'grunt-concurrent',
    'grunt-mocha-test',
    'grunt-env',
    'grunt-browserify',
    'grunt-contrib-concat',
    'grunt-rewrite'
  ].forEach(function (task) {
    grunt.loadNpmTasks(task)
  })

  grunt.registerTask('generate-assets', [
    'clean',
    'copy',
    'replace',
    'sass',
    'browserify',
    'concat',
    'rewrite',
    'compress',
    'cssmin'
  ])

  grunt.registerTask('test', ['env:test', 'mochaTest'])

  grunt.registerTask('default', ['generate-assets', 'concurrent:target'])

  /**
   * On watch, copy the asset that was changed, not all of them
   */
  grunt.event.on('watch', function (action, filepath, target) {
    if (target === 'assets') {
      grunt.config(
        'copy.assets.files.0.src',
        filepath.replace('app/assets/', '')
      )
    }
  })
}
