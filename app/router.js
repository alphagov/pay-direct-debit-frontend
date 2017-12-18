'use strict'

// Local dependencies
const healthcheck = require('./healthcheck')
const setup = require('./setup')
const directDebitGuarantee = require('./direct-debit-guarantee')
const confirmation = require('./confirmation')

// Export
module.exports.bind = app => {
  app.use(healthcheck.router)
  app.use(setup.router)
  app.use(directDebitGuarantee.router)
  app.use(confirmation.router)
}
