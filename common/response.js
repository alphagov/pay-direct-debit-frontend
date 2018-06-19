'use strict'

const logger = require('pino')()

const ERROR_MESSAGE = 'There is a problem with the payments platform'

function response (req, res, template, data) {
  return res.render(template, data)
}

function errorResponse (req, res, msg = ERROR_MESSAGE, status = 500, heading = 'Sorry, we’re experiencing technical problems') {
  logger.error(`[${req.correlationId}] ${status} An error has occurred. Rendering error view -`, {errorMessage: msg})
  res.setHeader('Content-Type', 'text/html')
  res.status(status)
  res.render('common/templates/error', {
    'message': msg,
    'heading': heading
  })
}

function renderPaymentCompletedSummary (req, res, params) {
  res.setHeader('Content-Type', 'text/html')
  res.status(200)
  res.render('common/templates/payment_completed_summary', params)
}

module.exports = {
  response: response,
  renderErrorView: errorResponse,
  renderPaymentCompletedSummary: renderPaymentCompletedSummary
}
