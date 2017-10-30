'use strict'
const paths = require('./paths.js')
const healthcheckController = require('./controllers/healthcheck_controller')
const CORRELATION_HEADER = require('./utils/correlation_header').CORRELATION_HEADER
const { healthcheck } = paths

module.exports.paths = paths

module.exports.bind = function (app) {
  /**
   * Apply correlation middleware in all requests
   **/
  app.use('*', (req, res, next) => {
    req.correlationId = req.headers[CORRELATION_HEADER] || ''
    next()
  })

  app.get(healthcheck.path, healthcheckController.healthcheck)
}
