const { createLogger, format, transports } = require('winston')
const { json, label, splat, prettyPrint } = format
const timestampFormat = require('./timestamp-format')

const logger = createLogger({
  format: format.combine(
    splat(),
    label({ label: 'direct-debit-frontend-sl-beta' }),
    prettyPrint(),
    timestampFormat(),
    json()
  ),
  transports: [
    new transports.Console()
  ]
})

module.exports = (loggerName) => {
  return logger.child({ logger: loggerName })
}
