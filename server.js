// Node.js core dependencies
const path = require('path')

// Please leave here even though it looks unused - this enables Node.js metrics to be pushed to Hosted Graphite
if (!process.env.DISABLE_APPMETRICS) {
  require('./common/utils/metrics').metrics()
}

// npm dependencies
const express = require('express')
const favicon = require('serve-favicon')
const bodyParser = require('body-parser')
const i18n = require('i18n')
const logger = require('pino')()
const loggingMiddleware = require('morgan')
const argv = require('minimist')(process.argv.slice(2))
const staticify = require('staticify')(path.join(__dirname, 'public'))
const compression = require('compression')
const nunjucks = require('nunjucks')

// Local dependencies
const router = require('./app/router')
const noCache = require('./common/utils/no-cache')
const correlationHeader = require('./common/middleware/correlation-header/correlation-header')
const cookieConfig = require('./common/config/cookies')

// Global constants
const unconfiguredApp = express()
const oneYear = 86400000 * 365
const publicCaching = { maxAge: oneYear }
const PORT = (process.env.PORT || 3000)
const { NODE_ENV } = process.env
const CSS_PATH = staticify.getVersionedPath('/stylesheets/application.min.css')
const JAVASCRIPT_PATH = staticify.getVersionedPath('/javascripts/application.min.js')
const ANALYTICS_TRACKING_ID = process.env.ANALYTICS_TRACKING_ID || ''

function warnIfAnalyticsNotSet () {
  if (ANALYTICS_TRACKING_ID === '') {
    logger.warn('Google Analytics Tracking ID [ANALYTICS_TRACKING_ID] is not set')
  }
}

// Define app views
const APP_VIEWS = [
  path.join(__dirname, 'node_modules/govuk-frontend/'),
  __dirname
]

function initialiseGlobalMiddleware (app) {
  app.set('settings', { getVersionedPath: staticify.getVersionedPath })
  app.use(favicon(path.join(__dirname, '/node_modules/govuk-frontend/assets/images', 'favicon.ico')))
  app.use(compression())
  app.use(staticify.middleware)

  if (process.env.DISABLE_REQUEST_LOGGING !== 'true') {
    app.use(/\/((?!images|public|stylesheets|javascripts).)*/, loggingMiddleware(
      ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" - total time :response-time ms'))
  }

  app.use(function (req, res, next) {
    res.locals.asset_path = '/public/'
    res.locals.analyticsTrackingId = ANALYTICS_TRACKING_ID
    noCache(res)
    next()
  })
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: true }))

  app.use('*', correlationHeader)
}
function initialiseCookies (app) {
  cookieConfig.configureSessionCookie(app)
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

function initialiseTemplateEngine (app) {
  // Configure nunjucks
  // see https://mozilla.github.io/nunjucks/api.html#configure
  const nunjucksConfiguration = {
    express: app, // the express app that nunjucks should install to
    autoescape: true, // controls if output with dangerous characters are escaped automatically
    throwOnUndefined: false, // throw errors when outputting a null/undefined value
    trimBlocks: true, // automatically remove trailing newlines from a block/tag
    lstripBlocks: true, // automatically remove leading whitespace from a block/tag
    watch: NODE_ENV !== 'production', // reload templates when they are changed (server-side). To use watch, make sure optional dependency chokidar is installed
    noCache: NODE_ENV !== 'production' // never use a cache and recompile templates each time (server-side)
  }

  // Initialise nunjucks environment
  const nunjucksEnvironment = nunjucks.configure(APP_VIEWS, nunjucksConfiguration)

  // Set view engine
  app.set('view engine', 'njk')

  // Version static assets on production for better caching
  // if it's not production we want to re-evaluate the assets on each file change
  nunjucksEnvironment.addGlobal('css_path', NODE_ENV === 'production' ? CSS_PATH : staticify.getVersionedPath('/stylesheets/application.min.css'))
  nunjucksEnvironment.addGlobal('js_path', NODE_ENV === 'production' ? JAVASCRIPT_PATH : staticify.getVersionedPath('/javascripts/application.js'))
}

function initialisePublic (app) {
  app.use('/public', express.static(path.join(__dirname, '/public')))
  app.use('/', express.static(path.join(__dirname, '/node_modules/govuk-frontend/')))
  app.use('/javascripts', express.static(path.join(__dirname, '/public/assets/javascripts'), publicCaching))
  app.use('/images', express.static(path.join(__dirname, '/public/images'), publicCaching))
  app.use('/stylesheets', express.static(path.join(__dirname, '/public/assets/stylesheets'), publicCaching))
}

function initialiseRoutes (app) {
  router.bind(app)
}

function listen () {
  const app = initialise()
  app.listen(PORT)
  logger.info('Listening on port ' + PORT)
}

/**
 * Configures app
 * @return app
 */
function initialise () {
  const app = unconfiguredApp
  app.disable('x-powered-by')
  initialiseProxy(app)
  initialiseCookies(app)
  initialiseI18n(app)
  initialiseGlobalMiddleware(app)
  initialiseTemplateEngine(app)
  initialisePublic(app)
  initialiseRoutes(app) // this needs to be at the bottom otherwise all assets in public 404
  warnIfAnalyticsNotSet()
  return app
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
  getApp: initialise,
  staticify: staticify
}
