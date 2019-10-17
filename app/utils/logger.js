const { createLogger, format, transports } = require('winston')
const { json, splat, prettyPrint } = format
const loggerFormat = require('./logger-format')

const logger = createLogger({
  format: format.combine(
    splat(),
    prettyPrint(),
    loggerFormat({ container: 'directdebit-frontend' }),
    json()
  ),
  transports: [
    new transports.Console()
  ]
})

module.exports = (loggerName) => {
  return logger.child({ logger_name: loggerName })
}
