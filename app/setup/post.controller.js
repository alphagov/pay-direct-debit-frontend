'use strict'

// NPM dependencies
const lodash = require('lodash')

// Local dependencies
const confirmation = require('./../confirmation')
const normalise = require('../../common/utils/normalise')
const Payer = require('../../common/classes/Payer.class')
const payerValidator = require('../../common/utils/payer-validator')
const {renderErrorView} = require('../../common/response')
const connectorClient = require('../../common/clients/connector-client')

module.exports = (req, res) => {
  // Get request data
  const paymentRequest = req.session.paymentRequest
  const requestBody = req.body
  const formValues = {
    account_holder_name: lodash.get(requestBody, 'account-holder-name'),
    sort_code: lodash.get(requestBody, 'sort-code'),
    account_number: lodash.get(requestBody, 'account-number'),
    requires_authorisation: lodash.get(requestBody, 'requires-authorisation'),
    country_code: lodash.get(requestBody, 'country-code'),
    address_line1: lodash.get(requestBody, 'address-line1'),
    address_line2: lodash.get(requestBody, 'address-line2'),
    city: lodash.get(requestBody, 'city'),
    postcode: lodash.get(requestBody, 'postcode'),
    email: lodash.get(requestBody, 'email')
  }

  // Normalise request data
  const normalisedFormValues = lodash.clone(formValues)
  normalisedFormValues.sort_code = normalise.sortCode(formValues.sort_code)
  normalisedFormValues.account_number = normalise.accountNumber(formValues.account_number)
  normalisedFormValues.requires_authorisation =
    (lodash.isNil(formValues.requires_authorisation) || normalise.toBoolean(formValues.requires_authorisation))

  // Validation
  const payer = new Payer(normalisedFormValues)
  const payerValidatorErrors = payerValidator(payer)
  if (lodash.isEmpty(payerValidatorErrors)) {
    // Process request
    connectorClient.payment.submitDirectDebitDetails(paymentRequest.gatewayAccountId, req.params.paymentRequestExternalId, normalisedFormValues)
      .then(payerExternalId => {
        req.body.payer_external_id = payerExternalId
        req.session.confirmationDetails = payer
        const url = confirmation.paths.index.replace(':paymentRequestExternalId', req.params.paymentRequestExternalId)
        return res.redirect(303, url)
      })
      .catch(() => {
        renderErrorView(req, res, 'No money has been taken from your account, please try again later.')
      })
  } else {
    req.session.formValues = formValues
    req.session.validationErrors = payerValidatorErrors
    const url = '/setup/:paymentRequestExternalId'.replace(':paymentRequestExternalId', req.params.paymentRequestExternalId)
    return res.redirect(303, url)
  }
}
