'use strict'
const logger = require('pino')()
const _ = require('lodash')

// local dependencies
const {renderErrorView} = require('../response')
const {getSessionVariable} = require('../config/cookies')

function middleware (req, res, next) {
  const paymentRequestExternalId = req.params.paymentRequestExternalId
  const session = getSessionVariable(req, paymentRequestExternalId)
  const found = _.get(session, 'paymentRequestExternalId') === paymentRequestExternalId

  if (!found) {
    logger.error(`[${req.correlationId}] Session is not defined for ${paymentRequestExternalId}`)
    return renderErrorView(req, res, 'There is a problem with the payments platform')
  }

  logger.info(`[${req.correlationId}] Valid session defined for ${paymentRequestExternalId}`)
  res.locals.paymentRequestExternalId = session.paymentRequestExternalId
  res.locals.gatewayAccountExternalId = session.gatewayAccountExternalId
  return next()
}

// Exports
module.exports = {
  middleware
}
