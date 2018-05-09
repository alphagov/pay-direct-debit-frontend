'use strict'

const {renderErrorView} = require('../../common/response')
const connectorClient = require('../../common/clients/connector-client')
const {getSessionVariable} = require('../../common/config/cookies')

module.exports = (req, res) => {
  const paymentRequest = res.locals.paymentRequest
  const session = getSessionVariable(req, paymentRequest.externalId)
  connectorClient.payment.confirmDirectDebitDetails(paymentRequest.gatewayAccountExternalId, paymentRequest.externalId, {
    account_number: session.confirmationDetails.accountNumber,
    sort_code: session.confirmationDetails.sortCode.match(/.{2}/g).join('')
  }, req.correlationId)
    .then(() => {
      return res.redirect(303, paymentRequest.returnUrl)
    })
    .catch(() => {
      renderErrorView(req, res, 'No money has been taken from your account, please try again later.', 500)
    })
}
