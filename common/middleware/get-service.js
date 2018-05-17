'use strict'

// npm dependencies
const _ = require('lodash')
const logger = require('pino')()

// local dependencies
const {renderErrorView} = require('../response')
const adminusersClient = require('../clients/adminusers-client')

function middleware (req, res, next) {
  const gatewayAccountExternalId = _.get(res, 'locals.gatewayAccountExternalId')
  if (!gatewayAccountExternalId) {
    logger.error(`[${req.correlationId}] Failed to retrieve gateway account external id from res.locals`)
    return renderErrorView(req, res)
  }
  adminusersClient.retrieveService(gatewayAccountExternalId, req.correlationId)
    .then(service => {
      res.locals.service = service
      next()
    })
    .catch(() => {
      logger.error(`[${req.correlationId}] Failed to load service from adminusers: ${gatewayAccountExternalId}`)
      renderErrorView(req, res)
    })
}

module.exports = {
  middleware
}
