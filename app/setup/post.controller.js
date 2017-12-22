'use strict'

// NPM dependencies
const _ = require('lodash')

// Local dependencies
const confirmation = require('./../confirmation')
const Payer = require('../../common/classes/Payer.class')
const {renderErrorView} = require('../../common/response')
const connectorClient = require('../../common/clients/connector-client')

module.exports = (req, res) => {
  let paymentRequest = req.session.paymentRequest
  const requestBody = req.body
  let formValues = { account_holder_name: _.get(requestBody, 'account-holder-name'),
    sort_code: _.get(requestBody, 'sort-code'),
    account_number: _.get(requestBody, 'account-number'),
    requires_authorisation: _.get(requestBody, 'requires-authorisation'),
    country_code: _.get(requestBody, 'country-code'),
    address_line1: _.get(requestBody, 'address-line1'),
    city: _.get(requestBody, 'city'),
    postcode: _.get(requestBody, 'postcode'),
    email: _.get(requestBody, 'email') }
  if (_.get(requestBody, 'address-line2')) {
    formValues.address_line2 = _.get(requestBody, 'address-line2')
  }
  connectorClient.payment.submitDirectDebitDetails(paymentRequest.gatewayAccountId, req.params.paymentRequestExternalId, formValues)
    .then(payerExternalId => {
      req.body.payer_external_id = payerExternalId
      req.session.confirmationDetails = new Payer(formValues)
      let url = confirmation.paths.index.replace(':paymentRequestExternalId', req.params.paymentRequestExternalId)
      return res.redirect(303, url)
    })
    .catch(() => {
      // todo re-render this page with meaningful validation errors if connector gives back a 400 Bad Request
      renderErrorView(req, res, 'No money has been taken from your account, please try again later.', 500)
    })
}
