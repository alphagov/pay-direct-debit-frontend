'use strict'

const {renderErrorView} = require('../../common/response')
const connectorClient = require('../../common/clients/connector-client')
const {getSessionVariable} = require('../../common/config/cookies')

module.exports = (req, res) => {
  const paymentRequestExternalId = req.params.paymentRequestExternalId
  const paymentRequest = getSessionVariable(req, paymentRequestExternalId).paymentRequest
  connectorClient.payment.confirmDirectDebitDetails(paymentRequest.gatewayAccountId, paymentRequestExternalId, req.correlationId)
    .then(() => {
      return res.redirect(303, paymentRequest.returnUrl)
    })
    .catch(() => {
      renderErrorView(req, res, 'No money has been taken from your account, please try again later.', 500)
    })
}
