'use strict'

const {renderErrorView} = require('../../common/response')
const connectorClient = require('../../common/clients/connector-client')
module.exports = (req, res) => {
  const paymentRequest = req.session.paymentRequest
  connectorClient.payment.confirmDirectDebitDetails(paymentRequest.gatewayAccountId, req.params.paymentRequestExternalId)
    .then(() => {
      return res.redirect(303, req.session.paymentRequest.returnUrl)
    })
    .catch(() => {
      renderErrorView(req, res, 'No money has been taken from your account, please try again later.', 500)
    })
}
