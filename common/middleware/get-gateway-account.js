'use strict'

// npm dependencies
const _ = require('lodash')
const logger = require('pino')()
const {Cache} = require('memory-cache')

// local dependencies
const {renderErrorView} = require('../response')
const connectorClient = require('../clients/connector-client')

// constants
const CACHE_MAX_AGE = parseInt(process.env.CACHE_MAX_AGE || 15 * 60 * 1000) // default to 15 mins
const cache = new Cache()

function middleware (req, res, next) {
  const paymentRequest = _.get(req, 'res.locals.paymentRequest')
  if (!paymentRequest) {
    logger.error(`[${req.correlationId}] Failed to retrieve payment request from res.locals`)
    return renderErrorView(req, res)
  }

  const gatewayAccountExternalId = paymentRequest.gatewayAccountExternalId
  const cachedGatewayAccount = cache.get(gatewayAccountExternalId)
  if (cachedGatewayAccount) {
    res.locals.gatewayAccount = cachedGatewayAccount
    next()
  } else {
    connectorClient.retrieveGatewayAccount(gatewayAccountExternalId, req.correlationId)
      .then(gatewayAccount => {
        cache.put(gatewayAccountExternalId, gatewayAccount, CACHE_MAX_AGE)
        res.locals.gatewayAccount = gatewayAccount
        next()
      })
      .catch(() => {
        logger.error(`[${req.correlationId}] Failed to load gateway account from connector: ${gatewayAccountExternalId}`)
        renderErrorView(req, res)
      })
  }
}

module.exports = {
  CACHE_MAX_AGE,
  middleware
}
