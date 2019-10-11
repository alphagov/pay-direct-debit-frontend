const { createLogger, format, transports } = require('winston')
const { timestamp, json, label, splat, prettyPrint } = format

const timetstampFormat = format((timestamp) => {
  return {
    '@timestamp': timestamp
  }
})

const logger = createLogger({
  format: format.combine(
    splat(),
    label({ label: 'direct-debit-frontend-sl-beta' }),
    prettyPrint(),
    json(),
    timetstampFormat(timestamp())
  ),
  transports: [
    new transports.Console()
  ]
})

module.exports = (loggerName) => {
  return logger.child({ logger: loggerName })
}
