const logger = require('../../app/utils/logger')(__filename)

module.exports = {
  logRequestStart: context => {
    logger.debug(`Calling ${context.service}  ${context.description}-`, {
      service: context.service,
      method: context.method,
      url: context.url
    })
  },

  logRequestEnd: context => {
    const duration = new Date() - context.startTime
    logger.info(`[${context.correlationId}] - ${context.method} to ${context.url} ended - elapsed time: ${duration} ms`)
  },

  logRequestFailure: (context, response) => {
    logger.error(`[${context.correlationId}] Calling ${context.service} to ${context.description} failed -`, {
      service: context.service,
      method: context.method,
      url: context.url,
      status: response.statusCode
    })
  },

  logRequestError: (context, error) => {
    logger.error(`[${context.correlationId}] Calling ${context.service} to ${context.description} threw exception -`, {
      service: context.service,
      method: context.method,
      url: context.url,
      error: error
    })
  }
}
