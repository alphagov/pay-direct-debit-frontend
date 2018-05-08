'use strict'

const {renderErrorView} = require('../../common/response')
const connectorClient = require('../../common/clients/connector-client')

module.exports = (req, res) => {
  const paymentRequest = res.locals.paymentRequest

  const params = {
    returnUrl: paymentRequest.returnUrl
  }
  connectorClient.payment.cancelPaymentRequest(paymentRequest.gatewayAccountExternalId, paymentRequest.externalId, req.correlationId)
    .then(() => {
      return res.render('app/cancel/get', params)
    })
    .catch(() => {
      renderErrorView(req, res, 'No money has been taken from your account, please try again later.', 500)
    })
}
