const { createLogger, format, transports } = require('winston')
const { timestamp, json, label, prettyPrint } = format

const logger = createLogger({
  format: format.combine(
    timestamp({
      alias: '@timestamp'
    }),
    label({ label: 'direct-debit-frontend-sl-beta' }),
    prettyPrint(),
    json()
  ),
  transports: [
    new transports.Console()
  ]
})

module.exports = (loggerName) => {
  return logger.child({ logger: loggerName })
}
