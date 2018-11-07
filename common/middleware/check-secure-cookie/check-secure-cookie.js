'use strict'
const logger = require('pino')()
const _ = require('lodash')

// local dependencies
const { renderErrorView } = require('../../response')
const { getSessionVariable } = require('../../config/cookies')

function middleware (req, res, next) {
  const mandateExternalId = req.params.mandateExternalId
  const session = getSessionVariable(req, mandateExternalId)
  const found = _.get(session, 'mandateExternalId') === mandateExternalId

  if (!found) {
    logger.error(`[${req.correlationId}] Session is not defined for ${mandateExternalId}`)
    return renderErrorView(req, res, 'There is a problem with the payments platform')
  }

  logger.info(`[${req.correlationId}] Valid session defined for ${mandateExternalId}`)
  res.locals.mandateExternalId = session.mandateExternalId
  res.locals.gatewayAccountExternalId = session.gatewayAccountExternalId
  res.locals.transactionExternalId = session.transactionExternalId
  return next()
}

// Exports
module.exports = {
  middleware
}
