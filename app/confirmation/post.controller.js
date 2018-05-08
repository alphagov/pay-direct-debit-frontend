'use strict'

const {renderErrorView} = require('../../common/response')
const connectorClient = require('../../common/clients/connector-client')

module.exports = (req, res) => {
  const paymentRequest = res.locals.paymentRequest

  connectorClient.payment.confirmDirectDebitDetails(paymentRequest.gatewayAccountExternalId, paymentRequest.externalId, req.correlationId)
    .then(() => {
      return res.redirect(303, paymentRequest.returnUrl)
    })
    .catch(() => {
      renderErrorView(req, res, 'No money has been taken from your account, please try again later.', 500)
    })
}
