'use strict'

// npm dependencies
const _ = require('lodash')

// local dependencies
const logger = require('../../../app/utils/logger')(__filename)
const { renderErrorView } = require('../../response')
const connectorClient = require('../../clients/connector-client')

function middleware (req, res, next) {
  const mandateExternalId = _.get(res, 'locals.mandateExternalId')
  if (!mandateExternalId) {
    logger.error(`[${req.correlationId}] Failed to retrieve mandate external id from res.locals`)
    return renderErrorView(req, res)
  }

  const gatewayAccountExternalId = _.get(res, 'locals.gatewayAccountExternalId')
  if (!gatewayAccountExternalId) {
    logger.error(`[${req.correlationId}] Failed to retrieve mandate external id from res.locals`)
    return renderErrorView(req, res)
  }

  connectorClient.mandate.retrieveMandateByExternalId(gatewayAccountExternalId, mandateExternalId, req.correlationId)
    .then(mandate => {
      res.locals.mandate = mandate
      next()
    })
    .catch(() => {
      logger.error(`[${req.correlationId}] Failed to load mandate from connector: ${mandateExternalId}`)
      renderErrorView(req, res)
    })
}

module.exports = {
  middleware
}
