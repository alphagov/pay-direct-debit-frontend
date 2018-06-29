'use strict'

// Local Dependencies
const baseClient = require('./base-client/base-client')
const {CONNECTOR_URL} = require('../config')
const Mandate = require('../../common/classes/Mandate.class')
const GatewayAccount = require('../../common/classes/GatewayAccount.class')

const service = 'connector'
const baseUrl = `${CONNECTOR_URL}/v1`
const headers = {}

// Exports
module.exports = {
  retrieveGatewayAccount,
  secure: {
    retrieveMandateByToken,
    retrievePaymentInformationByExternalId,
    deleteToken
  },
  payment: {
    submitDirectDebitDetails,
    confirmDirectDebitDetails,
    cancelTransaction,
    changePaymentMethod,
    validateBankAccountDetails
  }
}

function retrieveGatewayAccount (gatewayAccountId, correlationId) {
  return baseClient.get({
    headers,
    baseUrl,
    url: `/api/accounts/${gatewayAccountId}`,
    service: service,
    correlationId: correlationId,
    description: `retrieve a gateway account`
  }).then(gatewayAccount => new GatewayAccount(gatewayAccount))
}

function retrievePaymentInformationByExternalId (gatewayAccountExternalId, mandateExternalId, paymentExternalId, correlationId) {
  const url = `/accounts/${gatewayAccountExternalId}/mandates/${mandateExternalId}` + (paymentExternalId ? `/payments/${paymentExternalId}` : '')
  return baseClient.get({
    headers,
    baseUrl,
    url,
    service: service,
    correlationId: correlationId,
    description: `retrieve mandate information by external id`
  }).then(mandate => new Mandate(mandate))
}

function retrieveMandateByToken (token, correlationId) {
  return baseClient.get({
    headers,
    baseUrl,
    url: `/tokens/${token}/mandate`,
    service: service,
    correlationId: correlationId,
    description: `retrieve information about a mandate by its one-time token`
  }).then(mandate => new Mandate(mandate))
}

function deleteToken (token, correlationId) {
  return baseClient.delete({
    headers,
    baseUrl,
    url: `/tokens/${token}`,
    service: service,
    correlationId: correlationId,
    description: `delete a one-time token`
  })
}

function submitDirectDebitDetails (accountId, mandateExternalId, body, correlationId) {
  return baseClient.put({
    headers,
    baseUrl,
    json: true,
    url: `/api/accounts/${accountId}/mandates/${mandateExternalId}/payers`,
    service: service,
    body: body,
    correlationId: correlationId,
    description: `create a payer and store hashed bank account details`
  }).then(response => {
    return response.payer_external_id
  })
}

function confirmDirectDebitDetails (accountId, mandateExternalId, body, correlationId) {
  return baseClient.post({
    headers,
    baseUrl,
    json: true,
    url: `/api/accounts/${accountId}/mandates/${mandateExternalId}/confirm`,
    service: service,
    body: body,
    correlationId: correlationId,
    description: `confirm a payment`
  })
}

function validateBankAccountDetails (accountId, mandateExternalId, body, correlationId) {
  return baseClient.post({
    headers,
    baseUrl,
    json: true,
    url: `/api/accounts/${accountId}/mandates/${mandateExternalId}/payers/bank-account/validate`,
    service: service,
    body: body,
    correlationId: correlationId,
    description: `validate bank account details`
  })
}

function cancelTransaction (accountId, mandateExternalId, correlationId) {
  return baseClient.post({
    headers,
    baseUrl,
    url: `/api/accounts/${accountId}/mandates/${mandateExternalId}/cancel`,
    service: service,
    correlationId: correlationId,
    description: `cancel a payment request`
  })
}

function changePaymentMethod (accountId, mandateExternalId, correlationId) {
  return baseClient.post({
    headers,
    baseUrl,
    url: `/api/accounts/${accountId}/mandates/${mandateExternalId}/change-payment-method`,
    service: service,
    correlationId: correlationId,
    description: `cancel a payment request when user not eligible for setting up a Direct Debit`
  })
}
