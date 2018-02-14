'use strict'

// NPM Dependencies
const csrf = require('csrf')
const logger = require('pino')()

// Local Dependencies
const {renderErrorView} = require('../response')
const {getSessionVariable, setSessionVariable} = require('../../common/config/cookies')
// Assignments and Variables
const errorMsg = 'There is a problem with the payments platform'

// Exports
module.exports = {
  validateAndRefreshCsrf,
  ensureSessionHasCsrfSecret
}

// Middleware methods
function validateAndRefreshCsrf (req, res, next) {
  const paymentRequestExternalId = res.locals.paymentRequestExternalId
  const session = getSessionVariable(req, paymentRequestExternalId)

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
  const paymentRequestExternalId = res.locals.paymentRequestExternalId
  const csrfSecret = getSessionVariable(req, paymentRequestExternalId).csrfSecret
  if (csrfSecret) return next()
  setSessionVariable(req, `${paymentRequestExternalId}.csrfSecret`, csrf().secretSync())
  logger.info(`[${req.correlationId}] Saved csrfSecret: ${getSessionVariable(req, paymentRequestExternalId).csrfSecret}`)

  return next()
}

// Other Methods
function isValidCsrf (req, res) {
  const paymentRequestExternalId = res.locals.paymentRequestExternalId
  const csrfSecret = getSessionVariable(req, paymentRequestExternalId).csrfSecret
  return csrf().verify(csrfSecret, req.body.csrfToken)
}
