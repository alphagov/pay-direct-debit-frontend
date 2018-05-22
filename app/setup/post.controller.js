'use strict'

// NPM dependencies
const lodash = require('lodash')
const logger = require('pino')()

// Local dependencies
const confirmation = require('./../confirmation')
const normalise = require('../../common/utils/normalise')
const Payer = require('../../common/classes/Payer.class')
const payerValidator = require('../../common/utils/payer-validator')
const {renderErrorView} = require('../../common/response')
const connectorClient = require('../../common/clients/connector-client')
const {setSessionVariable} = require('../../common/config/cookies')

module.exports = (req, res) => {
  const paymentRequest = res.locals.paymentRequest
  const paymentRequestExternalId = paymentRequest.externalId
  const gatewayAccountExternalId = paymentRequest.gatewayAccountExternalId

  const requestBody = req.body
  const formValues = {
    account_holder_name: lodash.get(requestBody, 'account-holder-name'),
    sort_code: lodash.get(requestBody, 'sort-code'),
    account_number: lodash.get(requestBody, 'account-number'),
    requires_authorisation: lodash.get(requestBody, 'requires-authorisation'),
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
  const redirectWithValidationErrors = prepareValidationErrors(res, req, paymentRequestExternalId, formValues)
  if (lodash.isEmpty(payerValidatorErrors)) {
    connectorClient.payment.validateBankAccountDetails(gatewayAccountExternalId, paymentRequestExternalId, {
      account_number: normalisedFormValues.account_number,
      sort_code: normalisedFormValues.sort_code
    }, req.correlationId)
      .then(bankAccount => {
        // if (bankAccount.is_valid) {
        //   normalisedFormValues.bank_name = bankAccount.bank_name
        //   connectorClient.payment.submitDirectDebitDetails(gatewayAccountExternalId, paymentRequestExternalId, normalisedFormValues, req.correlationId)
        //     .then(payerExternalId => {
        //       logger.info(`[${req.correlationId}] Submitted payment details for request: ${paymentRequestExternalId}, payer: ${payerExternalId}`)
        //       req.body.payer_external_id = payerExternalId
        //       setSessionVariable(req, `${paymentRequestExternalId}.confirmationDetails`, payer)
        //       const url = confirmation.paths.index.replace(':paymentRequestExternalId', paymentRequestExternalId)
        //       return res.redirect(303, url)
        //     })
        //     .catch(() => {
        //       renderErrorView(req, res, 'No money has been taken from your account, please try again later.')
        //     })
        // } else {
          redirectWithValidationErrors([
            {
              id: 'sort-code',
              label: 'Sort code'
            },
            {
              id: 'account-number',
              label: 'Account number'
            }
          ])
        // }
      })
  } else {
    redirectWithValidationErrors(payerValidatorErrors)
  }
}
const prepareValidationErrors = (res, req, paymentRequestExternalId, formValues) => (validationErrors) => {
  setSessionVariable(req, `${paymentRequestExternalId}.formValues`, formValues)
  setSessionVariable(req, `${paymentRequestExternalId}.validationErrors`, validationErrors)
  const url = '/setup/:paymentRequestExternalId'.replace(':paymentRequestExternalId', paymentRequestExternalId)
  return res.redirect(303, url)
}
