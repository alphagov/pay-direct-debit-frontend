'use strict'

const logger = require('pino')()

const ERROR_MESSAGE = 'There is a problem with the payments platform'

function response (req, res, template, data) {
  return res.render(template, data)
}

function renderErrorView (req, res, msg = ERROR_MESSAGE, status = 500) {
  logger.error(`[${req.correlationId}] ${status} An error has occurred. Rendering error view -`, {errorMessage: msg})
  res.setHeader('Content-Type', 'text/html')
  res.status(status)
  res.render('common/templates/error', {'message': msg})
}

module.exports = {
  response,
  renderErrorView
}
