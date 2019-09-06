'use strict'

// NPM Dependencies
const csrf = require('csrf')

// Local Dependencies
const logger = require('../../../app/utils/logger')(__filename)
const { renderErrorView } = require('../../response')
const { getSessionVariable, setSessionVariable } = require('../../config/cookies')
// Assignments and Variables
const errorMsg = 'There is a problem with the payments platform'

// Exports
module.exports = {
  validateAndRefreshCsrf,
  ensureSessionHasCsrfSecret
}

// Middleware methods
function validateAndRefreshCsrf (req, res, next) {
  const mandateExternalId = res.locals.mandateExternalId
  const session = getSessionVariable(req, mandateExternalId)

  if (!session) {
    logger.warn(`[${req.correlationId}] Session is not defined`)
    return renderErrorView(req, res, errorMsg, 400)
  }

  const csrfSecret = session.csrfSecret
  if (!csrfSecret) {
    logger.warn(`[${req.correlationId}] CSRF secret is not defined for session`)
    return renderErrorView(req, res, errorMsg, 400)
  }

  if (req.method !== 'GET' && !isValidCsrf(req, res)) {
    logger.warn(`[${req.correlationId}] CSRF secret provided is invalid`)
    return renderErrorView(req, res, errorMsg, 400)
  }

  res.locals.csrf = csrf().create(csrfSecret)
  next()
}

function ensureSessionHasCsrfSecret (req, res, next) {
  const mandateExternalId = res.locals.mandateExternalId
  const csrfSecret = getSessionVariable(req, mandateExternalId).csrfSecret
  if (csrfSecret) return next()
  setSessionVariable(req, `${mandateExternalId}.csrfSecret`, csrf().secretSync())
  logger.info(`[${req.correlationId}] Saved csrfSecret: ${getSessionVariable(req, mandateExternalId).csrfSecret}`)

  return next()
}

// Other Methods
function isValidCsrf (req, res) {
  const mandateExternalId = res.locals.mandateExternalId
  const csrfSecret = getSessionVariable(req, mandateExternalId).csrfSecret
  return csrf().verify(csrfSecret, req.body.csrfToken)
}
