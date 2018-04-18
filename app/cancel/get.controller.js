'use strict'

const {renderErrorView} = require('../../common/response')
const connectorClient = require('../../common/clients/connector-client')
const {getSessionVariable} = require('../../common/config/cookies')

module.exports = (req, res) => {
  const paymentRequestExternalId = req.params.paymentRequestExternalId
  const paymentRequest = getSessionVariable(req, paymentRequestExternalId).paymentRequest
  const params = {
    returnUrl: paymentRequest.returnUrl
  }
  connectorClient.payment.cancelPaymentRequest(paymentRequest.gatewayAccountExternalId, paymentRequestExternalId, req.correlationId)
    .then(() => {
      return res.render('app/cancel/get', params)
    })
    .catch(() => {
      renderErrorView(req, res, 'No money has been taken from your account, please try again later.', 500)
    })
}
