'use strict'

const {renderErrorView} = require('../../common/response')
const connectorClient = require('../../common/clients/connector-client')
const setup = require('../setup')
module.exports = (req, res) => {
  const token = req.body.chargeTokenId
  connectorClient.secure.retrievePaymentRequest(token)
    .then(paymentRequest => {
      // todo need to generate csrf
      // todo need to delete token
      let url = setup.paths.index.replace(':paymentRequestExternalId', paymentRequest.externalId)
      return res.redirect(303, url)
    })
    .catch(() => {
      renderErrorView(req, res, 'No money has been taken from your account, please try again later.', 500)
    })
}
