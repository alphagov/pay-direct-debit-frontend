const path = require('path')
const express = require('express')
const favicon = require('serve-favicon')
const bodyParser = require('body-parser')
const i18n = require('i18n')
const logger = require('winston')
const loggingMiddleware = require('morgan')
const argv = require('minimist')(process.argv.slice(2))
const staticify = require('staticify')(path.join(__dirname, 'public'))
const router = require(path.join(__dirname, '/app/router'))
const noCache = require(path.join(__dirname, '/app/utils/no_cache'))
const compression = require('compression')
const oneYear = 86400000 * 365
const publicCaching = {maxAge: oneYear}
const port = (process.env.PORT || 3000)
const expressApp = express()

function initialiseGlobalMiddleware (app) {
  app.set('settings', {getVersionedPath: staticify.getVersionedPath})
  logger.stream = {
    write: function (message) {
      logger.info(message)
    }
  }
  app.use(favicon(path.join(__dirname, 'govuk_modules', 'govuk_template', 'assets', 'images', 'favicon.ico')))
  app.use(compression())
  app.use(staticify.middleware)
  app.use(/\/((?!images|public|stylesheets|javascripts).)*/, loggingMiddleware(
    ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" - total time :response-time ms'))
  app.use(function (req, res, next) {
    noCache(res)
    next()
  })
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: true }))
}

function initialiseI18n (app) {
  i18n.configure({
    locales: ['en'],
    directory: path.join(__dirname, '/locales'),
    objectNotation: true,
    defaultLocale: 'en',
    register: global
  })
  app.use(i18n.init)
}

function initialiseProxy (app) {
  app.enable('trust proxy')
}

function initialiseViewsConfiguration (app) {
  app.engine('html', require(path.join(__dirname, '/lib/template-engine.js')).__express)
  app.set('view engine', 'html')
  app.set('vendorViews', path.join(__dirname, '/govuk_modules/govuk_template/views/layouts'))
  app.set('views', path.join(__dirname, '/app/views'))
}

function initialisePublic (app) {
  app.use('/javascripts', express.static(path.join(__dirname, '/public/assets/javascripts'), publicCaching))
  app.use('/images', express.static(path.join(__dirname, '/public/images'), publicCaching))
  app.use('/stylesheets', express.static(path.join(__dirname, '/public/assets/stylesheets'), publicCaching))
  app.use('/public', express.static(path.join(__dirname, '/public')))
  app.use('/public', express.static(path.join(__dirname, '/govuk_modules/govuk_frontend_toolkit')))
  app.use('/public', express.static(path.join(__dirname, '/govuk_modules/govuk_template/assets')))
}

function initialiseRoutes (app) {
  router.bind(app)
}

function listen () {
  const app = initialise()
  app.listen(port)
  logger.log('Listening on port ' + port)
}

/**
 * Configures app
 * @return app
 */
function initialise () {
  expressApp.disable('x-powered-by')
  initialiseProxy(expressApp)
  initialiseI18n(expressApp)
  initialiseGlobalMiddleware(expressApp)
  initialiseViewsConfiguration(expressApp)
  initialiseRoutes(expressApp)
  initialisePublic(expressApp)
  return expressApp
}

/**
 * Starts app after ensuring DB is up
 */
function start () {
  listen()
}

/**
 * -i flag. Immediately invoke start.
 * Allows script to be run by task runner
 */
if (argv.i) {
  start()
}

module.exports = {
  start: start,
  getApp: initialise
}
