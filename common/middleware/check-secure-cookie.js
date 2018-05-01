'use strict'
const logger = require('pino')()

// local dependencies
const {renderErrorView} = require('../response')
const {getSessionVariable} = require('../config/cookies')

function middleware (req, res, next) {
  const paymentRequestExternalId = req.params.paymentRequestExternalId

  const found = getSessionVariable(req, paymentRequestExternalId) === paymentRequestExternalId

  if (!found) {
    logger.error(`[${req.correlationId}] Session is not defined for ${paymentRequestExternalId}`)
    return renderErrorView(req, res, 'There is a problem with the payments platform')
  }

  logger.info(`[${req.correlationId}] Valid session defined for ${paymentRequestExternalId}`)
  res.locals.paymentRequestExternalId = paymentRequestExternalId
  return next()
}

// Exports
module.exports = {
  middleware
}
