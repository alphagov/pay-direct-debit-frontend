const { createLogger, format, transports } = require('winston')
const { json, splat, prettyPrint } = format
const { govUkPayLoggingFormat } = require('@govuk-pay/pay-js-commons').logging
const WinstonSentryTransport = require('./winstonSentryTransport')

const logger = createLogger({
  format: format.combine(
    splat(),
    prettyPrint(),
    govUkPayLoggingFormat({ container: 'directdebit-frontend', environment: process.env.ENVIRONMENT }),
    json()
  ),
  transports: [
    new transports.Console()
  ]
})

const sentryTransport = new WinstonSentryTransport({
  level: 'error'
})
logger.add(sentryTransport)

module.exports = (loggerName) => {
  return logger.child({ logger_name: loggerName })
}
