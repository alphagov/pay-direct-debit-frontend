'use strict'

const {renderErrorView} = require('../../common/response')
const connectorClient = require('../../common/clients/connector-client')

module.exports = (req, res) => {
  const paymentRequest = res.locals.paymentRequest
  const paymentRequestExternalId = paymentRequest.externalId
  const gatewayAccountExternalId = paymentRequest.gatewayAccountExternalId
  const returnUrl = paymentRequest.returnUrl

  connectorClient.payment.changePaymentMethod(gatewayAccountExternalId, paymentRequestExternalId, req.correlationId)
    .then(() => {
      return res.redirect(303, returnUrl)
    })
    .catch(() => {
      renderErrorView(req, res, 'No money has been taken from your account, please try again later.', 500)
    })
}
