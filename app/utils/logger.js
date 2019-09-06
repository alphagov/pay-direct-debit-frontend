const { createLogger, format, transports } = require('winston')
const { timestamp, json, label, splat, prettyPrint } = format
const logger = createLogger({
  format: format.combine(
    splat(),
    label({ label: 'direct-debit-frontend-sl-beta' }),
    prettyPrint(),
    timestamp(),
    json()
  ),
  transports: [
    new transports.Console()
  ]
})

module.exports = ( loggerName ) => {
  return logger.child({ logger: loggerName })
}
