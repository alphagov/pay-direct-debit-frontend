const { createLogger, format, transports } = require('winston')
const { json, splat, prettyPrint } = format
const { getNamespace } = require('cls-hooked')
const {
  CORRELATION_ID,
  GATEWAY_ACCOUNT_ID,
  RESOURCE_TYPE,
  EXTERNAL_ID } = require('@govuk-pay/pay-js-commons').loggingKeys
const loggerFormat = require('./logger-format')

const addSessionData = format((info) => {
  const session = getNamespace('govuk-pay-logging')
  if (session) {
    info[CORRELATION_ID] = session.get(CORRELATION_ID)
    info[GATEWAY_ACCOUNT_ID] = session.get(GATEWAY_ACCOUNT_ID)
    info[RESOURCE_TYPE] = session.get(RESOURCE_TYPE)
    info[EXTERNAL_ID] = session.get(EXTERNAL_ID)
  }
  return info
})

const logger = createLogger({
  format: format.combine(
    splat(),
    prettyPrint(),
    loggerFormat({ container: 'directdebit-frontend' }),
    addSessionData(),
    json()
  ),
  transports: [
    new transports.Console()
  ]
})

module.exports = (loggerName) => {
  return logger.child({ logger_name: loggerName })
}
