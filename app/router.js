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
const { renderErrorView } = require('../common/response')

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
  app.get('/sentry-test-default', (req, res) => {
    throw new Error('My first Sentry error!')
  })

  app.get('/sentry-test', (req, res) => {
    renderErrorView(req, res, 'ERROR MESSAGE', 500, new Error('throwing a new error'))
  })

  // route to gov.uk 404 page
  // this has to be the last route registered otherwise it will redirect other routes
  app.all('*', (req, res) => res.redirect('https://www.gov.uk/404'))
}
