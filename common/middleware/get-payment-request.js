'use strict'

// npm dependencies
const logger = require('pino')()

// local dependencies
const {renderErrorView} = require('../response')
const connectorClient = require('../clients/connector-client')

function middleware (req, res, next) {
  const paymentRequestExternalId = req.params.paymentRequestExternalId
  console.log('req.params: ', req.params);

  if (!paymentRequestExternalId) {
    logger.error(`[${req.correlationId}] Failed to identify payment request externalId from query params: ${req.params}`)
    return renderErrorView(req, res)
  }

  connectorClient.retrievePaymentRequest(paymentRequestExternalId, req.correlationId)
    .then(paymentRequest => {
      res.locals.paymentRequest = paymentRequest
      next()
    })
    .catch(() => {
      logger.error(`[${req.correlationId}] Failed to load payment request from connector: ${paymentRequestExternalId}`)
      renderErrorView(req, res)
    })
}

module.exports = {
  middleware
}
