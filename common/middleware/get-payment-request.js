'use strict'
const logger = require('pino')()

// local dependencies
const {renderErrorView} = require('../response')
const {getSessionVariable} = require('../config/cookies')

function ensureSessionHasPaymentRequest (req, res, next) {
  const paymentRequestExternalId = req.params.paymentRequestExternalId

  const session = getSessionVariable(req, paymentRequestExternalId)

  if (!session) {
    logger.error(`[${req.correlationId}] Session is not defined for ${paymentRequestExternalId}`)
    return renderErrorView(req, res, 'There is a problem with the payments platform', 400)
  }

  const paymentRequest = session.paymentRequest

  if (!paymentRequest) {
    logger.error(`[${req.correlationId}] Could not retrieve payment request from session: ${paymentRequestExternalId}`)
    return renderErrorView(req, res)
  }
  logger.info(`[${req.correlationId}] Retrieved payment request from session: ${paymentRequestExternalId}`)
  res.locals.paymentRequestExternalId = paymentRequestExternalId
  res.locals.paymentRequest = paymentRequest
  return next()
}
// Exports
module.exports = {
  ensureSessionHasPaymentRequest: ensureSessionHasPaymentRequest
}
