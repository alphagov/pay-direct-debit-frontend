'use strict'

// Local dependencies
const healthcheck = require('./healthcheck')
const naxsiRequestDenied = require('./request-denied')
const secure = require('./secure')
const setup = require('./setup')
const cancel = require('./cancel')
const directDebitGuarantee = require('./direct-debit-guarantee')
const confirmation = require('./confirmation')
const changePaymentMethod = require('./change-payment-method')

// Export
module.exports.bind = app => {
  app.use(healthcheck.router)
  app.use(naxsiRequestDenied.router)
  app.use(secure.router)
  app.use(setup.router)
  app.use(cancel.router)
  app.use(directDebitGuarantee.router)
  app.use(confirmation.router)
  app.use(changePaymentMethod.router)
  // route to gov.uk 404 page
  // this has to be the last route registered otherwise it will redirect other routes
  app.all('*', (req, res) => res.redirect('https://www.gov.uk/404'))
}
