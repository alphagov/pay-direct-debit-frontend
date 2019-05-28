'use strict'

const { renderErrorView } = require('../../common/response')
const connectorClient = require('../../common/clients/connector-client')
const { getSessionVariable } = require('../../common/config/cookies')

module.exports = (req, res) => {
  const mandate = res.locals.mandate
  const session = getSessionVariable(req, mandate.externalId)
  const params = {
    account_number: session.confirmationDetails.accountNumber,
    sort_code: session.confirmationDetails.sortCode.match(/.{2}/g).join('')
  }
  connectorClient.payment.confirmDirectDebitDetails(mandate.gatewayAccountExternalId, mandate.externalId, params, req.correlationId)
    .then(() => {
      return res.redirect(303, mandate.returnUrl)
    })
    .catch(() => {
      renderErrorView(req, res, 'No money has been taken from your account, please try again later.', 500)
    })
}
