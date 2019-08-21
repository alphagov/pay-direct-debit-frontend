'use strict'

// npm dependencies
const _ = require('lodash')
const { Cache } = require('memory-cache')

// local dependencies
const logger = require('../../../app/utils/logger')
const { renderErrorView } = require('../../response')
const connectorClient = require('../../clients/connector-client')

// constants
const CACHE_MAX_AGE = parseInt(process.env.CACHE_MAX_AGE || 15 * 60 * 1000) // default to 15 mins
const cache = new Cache()

function middleware (req, res, next) {
  const gatewayAccountExternalId = _.get(res, 'locals.gatewayAccountExternalId')
  if (!gatewayAccountExternalId) {
    logger.error(`[${req.correlationId}] Failed to retrieve gateway account external id from res.locals`)
    return renderErrorView(req, res)
  }

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
