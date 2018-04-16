'use strict'

const {renderErrorView} = require('../../common/response')
const connectorClient = require('../../common/clients/connector-client')
const setup = require('../setup')
const {setSessionVariable} = require('../../common/config/cookies')

module.exports = (req, res) => {
  const token = req.body.chargeTokenId || req.params.chargeTokenId
  let retrievedPaymentRequest = null
  let retrievedGatewayAccount = null
  connectorClient.secure.retrievePaymentRequest(token, req.correlationId)
    .then(paymentRequest => {
      return connectorClient.secure.deleteToken(token, req.correlationId).then(() => {
        retrievedPaymentRequest = paymentRequest
        return Promise.resolve(paymentRequest)
      })
    })
    .then(paymentRequest => {
      return connectorClient.retrieveGatewayAccount(paymentRequest.gatewayAccountExternalId, req.correlationId).then(gatewayAccount => {
        retrievedGatewayAccount = gatewayAccount
        return Promise.resolve(gatewayAccount)
      })
    })
    .then(() => {
      const paymentRequestExternalId = retrievedPaymentRequest.externalId
      setSessionVariable(req, paymentRequestExternalId, {
        paymentRequest: retrievedPaymentRequest,
        gatewayAccount: retrievedGatewayAccount
      })
      const url = setup.paths.index.replace(':paymentRequestExternalId', paymentRequestExternalId)
      return res.redirect(303, url)
    })
    .catch(() => {
      renderErrorView(req, res, 'No money has been taken from your account, please try again later.', 500)
    })
}
