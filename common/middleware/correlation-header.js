'use strict'

// Constants
const CORRELATION_HEADER = 'x-request-id'

module.exports = (req, res, next) => {
  req.correlationId = req.headers[CORRELATION_HEADER] || ''
  next()
}
