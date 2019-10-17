'use strict'

// npm dependencies
const _ = require('lodash')
const { Cache } = require('memory-cache')
const { getNamespace } = require('cls-hooked')
const { GATEWAY_ACCOUNT_ID } = require('@govuk-pay/pay-js-commons').loggingKeys

// local dependencies
const logger = require('../../../app/utils/logger')(__filename)
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

  const loggingSession = getNamespace('govuk-pay-logging')

  const cachedGatewayAccount = cache.get(gatewayAccountExternalId)
  if (cachedGatewayAccount) {
    res.locals.gatewayAccount = cachedGatewayAccount
    loggingSession.set(GATEWAY_ACCOUNT_ID, cachedGatewayAccount.id)
    next()
  } else {
    connectorClient.retrieveGatewayAccount(gatewayAccountExternalId, req.correlationId)
      .then(gatewayAccount => {
        cache.put(gatewayAccountExternalId, gatewayAccount, CACHE_MAX_AGE)
        res.locals.gatewayAccount = gatewayAccount
        loggingSession.set(GATEWAY_ACCOUNT_ID, gatewayAccount.gatewayAccountId)
        next()
      })
      .catch(err => {
        logger.error(`[${req.correlationId}] Failed to load gateway account from connector: ${gatewayAccountExternalId}`)
        renderErrorView(req, res, 'Failed to load gateway account', 500, err)
      })
  }
}

module.exports = {
  CACHE_MAX_AGE,
  middleware
}
