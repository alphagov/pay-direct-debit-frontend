'use strict'

const {renderErrorView} = require('../../common/response')
const connectorClient = require('../../common/clients/connector-client')
const setup = require('../setup')
const {setSessionVariable} = require('../../common/config/cookies')

module.exports = (req, res) => {
  const token = req.body.chargeTokenId || req.params.chargeTokenId

  connectorClient.secure.retrieveMandateByToken(token, req.correlationId)
    .then(mandate => {
      return connectorClient.secure.deleteToken(token, req.correlationId).then(() => {
        return Promise.resolve(mandate)
      })
    })
    .then(mandate => {
      const url = setup.paths.index.replace(':mandateExternalId', mandate.externalId)
      setSessionVariable(req, mandate.externalId, {
        mandateExternalId: mandate.externalId,
        gatewayAccountExternalId: mandate.gatewayAccountExternalId,
        transactionExternalId: mandate.transactionExternalId
      })
      return res.redirect(303, url)
    })
    .catch(() => {
      renderErrorView(req, res, 'No money has been taken from your account, please try again later.', 500)
    })
}
