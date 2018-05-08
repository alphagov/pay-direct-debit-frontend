'use strict'

const {renderErrorView} = require('../../common/response')
const connectorClient = require('../../common/clients/connector-client')
const setup = require('../setup')
const {setSessionVariable} = require('../../common/config/cookies')

module.exports = (req, res) => {
  const token = req.body.chargeTokenId || req.params.chargeTokenId

  connectorClient.secure.retrievePaymentRequestByToken(token, req.correlationId)
    .then(paymentRequest => {
      return connectorClient.secure.deleteToken(token, req.correlationId).then(() => {
        return Promise.resolve(paymentRequest)
      })
    })
    .then((paymentRequest) => {
      const url = setup.paths.index.replace(':paymentRequestExternalId', paymentRequest.externalId)
      setSessionVariable(req, paymentRequest.externalId, {
        paymentRequestExternalId: paymentRequest.externalId,
        gatewayAccountExternalId: paymentRequest.gatewayAccountExternalId
      })
      return res.redirect(303, url)
    })
    .catch(() => {
      renderErrorView(req, res, 'No money has been taken from your account, please try again later.', 500)
    })
}
