'use strict'

// Local Dependencies
const baseClient = require('./base-client/base-client')
const {CONNECTOR_URL} = require('../config')
const PaymentRequest = require('../../common/classes/PaymentRequest.class')

const service = 'connector'
const baseUrl = `${CONNECTOR_URL}/v1`
const headers = {
}
// Exports
module.exports = {
  secure: {
    retrievePaymentRequest: retrievePaymentRequest,
    deleteToken: deleteToken
  },
  payment: {
    submitDirectDebitDetails: submitDirectDebitDetails,
    confirmDirectDebitDetails: confirmDirectDebitDetails
  }
}

function retrievePaymentRequest (token, correlationId) {
  return baseClient.get({
    headers,
    baseUrl,
    url: `/tokens/${token}/payment-request`,
    service: service,
    correlationId: correlationId,
    description: `retrieve a payment request by its one-time token`
  }).then(paymentRequest => new PaymentRequest(paymentRequest))
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

function submitDirectDebitDetails (accountId, paymentRequestExternalId, body, correlationId) {
  return baseClient.post({
    headers,
    baseUrl,
    json: true,
    url: `/api/accounts/${accountId}/payment-requests/${paymentRequestExternalId}/payers`,
    service: service,
    body: body,
    correlationId: correlationId,
    description: `create a payer and store hashed bank account details`
  }).then(response => {
    return response.payer_external_id
  })
}
function confirmDirectDebitDetails (accountId, paymentRequestExternalId, correlationId) {
  return baseClient.post({
    headers,
    baseUrl,
    json: true,
    url: `/api/accounts/${accountId}/payment-requests/${paymentRequestExternalId}/confirm`,
    service: service,
    correlationId: correlationId,
    description: `confirm a payment`
  })
}