'use strict'

// npm dependencies
const _ = require('lodash')
const logger = require('pino')()
const {Cache} = require('memory-cache')

// local dependencies
const {renderErrorView} = require('../../response')
const adminusersClient = require('../../clients/adminusers-client')

// constants
const CACHE_MAX_AGE = parseInt(process.env.CACHE_MAX_AGE || 15 * 60 * 1000) // default to 15 mins
const cache = new Cache()

function middleware (req, res, next) {
  const gatewayAccountExternalId = _.get(res, 'locals.gatewayAccountExternalId')
  if (!gatewayAccountExternalId) {
    logger.error(`[${req.correlationId}] Failed to retrieve gateway account external id from res.locals`)
    return renderErrorView(req, res)
  }
  const cachedService = cache.get(`${gatewayAccountExternalId}.service`)
  if (cachedService) {
    res.locals.service = cachedService
    next()
  } else {
    adminusersClient.retrieveService(gatewayAccountExternalId,
      req.correlationId)
      .then(service => {
        cache.put(`${gatewayAccountExternalId}.service`, service, CACHE_MAX_AGE)
        res.locals.service = service
        next()
      })
      .catch(() => {
        logger.error(
          `[${req.correlationId}] Failed to load service from adminusers: ${gatewayAccountExternalId}`)
        renderErrorView(req, res)
      })
  }
}

module.exports = {
  middleware
}
