'use strict'
const { getNamespace } = require('cls-hooked')
const { CORRELATION_ID } = require('@govuk-pay/pay-js-commons').loggingKeys
const config = require('../../config/index')
// Constants
const CORRELATION_HEADER = config.CORRELATION_HEADER

module.exports = (req, res, next) => {
  req.correlationId = req.headers[CORRELATION_HEADER] || ''
  getNamespace('govuk-pay-logging').set(CORRELATION_ID, req.correlationId)
  next()
}
