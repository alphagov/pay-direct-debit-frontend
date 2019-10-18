'use strict'
const _ = require('lodash')

// NPM Dependencies
const { EXTERNAL_ID } = require('@govuk-pay/pay-js-commons').logging.keys

// local dependencies
const logger = require('../../../app/utils/logger')(__filename)
const { renderErrorView } = require('../../response')
const { getSessionVariable } = require('../../config/cookies')

function middleware (req, res, next) {
  const mandateExternalId = req.params.mandateExternalId
  const session = getSessionVariable(req, mandateExternalId)
  const found = _.get(session, 'mandateExternalId') === mandateExternalId

  if (!found) {
    const loggedObject = {
      message: `[${req.correlationId}] Session is not defined for ${mandateExternalId}`,
      [EXTERNAL_ID]: mandateExternalId
    }
    logger.error(loggedObject)
    return renderErrorView(req, res, 'There is a problem with the payments platform')
  }

  logger.info(`[${req.correlationId}] Valid session defined for ${mandateExternalId}`)
  res.locals.mandateExternalId = session.mandateExternalId
  res.locals.gatewayAccountExternalId = session.gatewayAccountExternalId
  return next()
}

// Exports
module.exports = {
  middleware
}
