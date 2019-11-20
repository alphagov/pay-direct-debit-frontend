const TransportStream = require('winston-transport')
const Sentry = require('@sentry/node')

class WinstonSentryTransport extends TransportStream {
  log (info, callback) {
    setImmediate(() => {
      this.emit('logged', info)
    })

    Sentry.captureException(new Error(JSON.stringify(info)))
    callback()
  }
}

module.exports = WinstonSentryTransport
