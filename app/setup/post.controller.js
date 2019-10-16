'use strict'

// NPM dependencies
const lodash = require('lodash')

// Local dependencies
const logger = require('../utils/logger')(__filename)
const confirmation = require('./../confirmation')
const normalise = require('../../common/utils/normalise')
const Payer = require('../../common/classes/Payer.class')
const payerValidator = require('../../common/utils/payer-validator')
const { renderErrorView } = require('../../common/response')
const connectorClient = require('../../common/clients/connector-client')
const { setSessionVariable } = require('../../common/config/cookies')

const extractFormValues = requestBody => {
  return {
    account_holder_name: lodash.get(requestBody, 'account-holder-name'),
    sort_code: lodash.get(requestBody, 'sort-code'),
    account_number: lodash.get(requestBody, 'account-number'),
    requires_authorisation: lodash.get(requestBody, 'requires-authorisation'),
    email: lodash.get(requestBody, 'email')
  }
}

const normaliseFormValues = formValues => {
  const normalisedFormValues = lodash.clone(formValues)
  normalisedFormValues.sort_code = normalise.sortCode(formValues.sort_code)
  normalisedFormValues.account_number = normalise.accountNumber(formValues.account_number)
  normalisedFormValues.requires_authorisation =
    (lodash.isNil(formValues.requires_authorisation) || normalise.toBoolean(formValues.requires_authorisation))
  return normalisedFormValues
}

module.exports = async function (req, res) {
  const { mandate } = res.locals
  const mandateExternalId = mandate.externalId
  const { gatewayAccountExternalId } = mandate

  try {
    const formValues = extractFormValues(req.body)
    const normalisedPayerDetails = normaliseFormValues(formValues)

    const payer = new Payer(normalisedPayerDetails)
    let validationErrors = payerValidator(payer)

    if (lodash.isEmpty(validationErrors)) {
      const bankAccount = await connectorClient.mandate.validateBankAccountDetails(gatewayAccountExternalId, mandateExternalId, {
        account_number: normalisedPayerDetails.account_number,
        sort_code: normalisedPayerDetails.sort_code
      }, req.correlationId)

      if (bankAccount.is_valid) {
        normalisedPayerDetails.bank_name = bankAccount.bank_name
        const payerExternalId = await connectorClient.mandate.submitDirectDebitDetails(gatewayAccountExternalId, mandateExternalId, normalisedPayerDetails, req.correlationId)
        logger.info(`[${req.correlationId}] Submitted payment details for request: ${mandateExternalId}, payer: ${payerExternalId}`)
        req.body.payer_external_id = payerExternalId
      } else {
        validationErrors = [
          {
            id: 'sort-code',
            label: 'Sort code'
          },
          {
            id: 'account-number',
            label: 'Account number'
          }
        ]
      }
    }

    if (!lodash.isEmpty(validationErrors)) {
      setSessionVariable(req, `${mandateExternalId}.formValues`, formValues)
      setSessionVariable(req, `${mandateExternalId}.validationErrors`, validationErrors)
      const url = '/setup/:mandateExternalId'.replace(':mandateExternalId', mandateExternalId)
      return res.redirect(303, url)
    }

    setSessionVariable(req, `${mandateExternalId}.confirmationDetails`, payer)
    const url = confirmation.paths.index.replace(':mandateExternalId', mandateExternalId)
    return res.redirect(303, url)
  } catch (error) {
    renderErrorView(req, res, 'No money has been taken from your account, please try again later.', 500, error)
  }
}
