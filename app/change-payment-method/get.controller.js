'use strict'

const {renderErrorView} = require('../../common/response')
const connectorClient = require('../../common/clients/connector-client')

module.exports = (req, res) => {
  const mandate = res.locals.mandate

  connectorClient.payment.changePaymentMethod(mandate.gatewayAccountExternalId, mandate.externalId, req.correlationId)
    .then(() => {
      return res.redirect(303, mandate.returnUrl)
    })
    .catch(() => {
      renderErrorView(req, res, 'No money has been taken from your account, please try again later.', 500)
    })
}
