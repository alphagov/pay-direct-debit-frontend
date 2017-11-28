'use strict'
const paths = require('./paths.js')
const healthcheckController = require('./controllers/healthcheck-controller')
const indexController = require('./controllers/index-controller')
const CORRELATION_HEADER = require('./utils/correlation-header').CORRELATION_HEADER
const { healthcheck, index } = paths

module.exports.paths = paths

module.exports.bind = app => {
  /**
   * Apply correlation middleware in all requests
   **/
  app.use('*', (req, res, next) => {
    req.correlationId = req.headers[CORRELATION_HEADER] || ''
    next()
  })

  app.get(healthcheck.path, healthcheckController.healthcheck)
  app.get(index.path, indexController.index)
}
