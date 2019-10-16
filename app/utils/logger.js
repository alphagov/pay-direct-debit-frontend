const { createLogger, format, transports } = require('winston')
const { json, label, splat, prettyPrint } = format
const loggerFormat = require('./logger-format')

const logger = createLogger({
  format: format.combine(
    splat(),
    label({ label: 'directdebit-frontend' }),
    prettyPrint(),
    loggerFormat(),
    json()
  ),
  transports: [
    new transports.Console()
  ]
})

module.exports = (loggerName) => {
  return logger.child({ logger_name: loggerName })
}
