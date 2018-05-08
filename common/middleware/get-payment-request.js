'use strict'

// npm dependencies
const _ = require('lodash')
const logger = require('pino')()

// local dependencies
const {renderErrorView} = require('../response')
const connectorClient = require('../clients/connector-client')

function middleware (req, res, next) {
  const paymentRequestExternalId = _.get(res, 'locals.paymentRequestExternalId')
  if (!paymentRequestExternalId) {
    logger.error(`[${req.correlationId}] Failed to retrieve payment request external id from res.locals`)
    return renderErrorView(req, res)
  }

  const gatewayAccountExternalId = _.get(res, 'locals.gatewayAccountExternalId')
  if (!gatewayAccountExternalId) {
    logger.error(`[${req.correlationId}] Failed to retrieve gateway account external id from res.locals`)
    return renderErrorView(req, res)
  }

  connectorClient.secure.retrievePaymentRequestByExternalId(gatewayAccountExternalId, paymentRequestExternalId, req.correlationId)
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
