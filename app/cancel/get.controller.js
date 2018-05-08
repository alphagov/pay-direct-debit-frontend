'use strict'

const {renderErrorView} = require('../../common/response')
const connectorClient = require('../../common/clients/connector-client')

module.exports = (req, res) => {
  const paymentRequest = res.locals.paymentRequest
  const paymentRequestExternalId = paymentRequest.externalId
  const gatewayAccountExternalId = paymentRequest.gatewayAccountExternalId
  const returnUrl = paymentRequest.returnUrl

  const params = {
    returnUrl: returnUrl
  }
  connectorClient.payment.cancelPaymentRequest(gatewayAccountExternalId, paymentRequestExternalId, req.correlationId)
    .then(() => {
      return res.render('app/cancel/get', params)
    })
    .catch(() => {
      renderErrorView(req, res, 'No money has been taken from your account, please try again later.', 500)
    })
}
