'use strict'

const {renderErrorView} = require('../../common/response')
const connectorClient = require('../../common/clients/connector-client')
const setup = require('../setup')
const {setSessionVariable} = require('../../common/config/cookies')
module.exports = (req, res) => {
  const token = req.body.chargeTokenId || req.params.chargeTokenId
  connectorClient.secure.retrievePaymentRequest(token, req.correlationId)
    .then(paymentRequest => connectorClient.secure.deleteToken(token, req.correlationId).then(() => Promise.resolve(paymentRequest)))
    .then(paymentRequest => {
      const paymentRequestExternalId = paymentRequest.externalId
      setSessionVariable(req, paymentRequestExternalId, {
        paymentRequest
      })
      const url = setup.paths.index.replace(':paymentRequestExternalId', paymentRequestExternalId)
      return res.redirect(303, url)
    })
    .catch(() => {
      renderErrorView(req, res, 'No money has been taken from your account, please try again later.', 500)
    })
}
