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
  }
}

function retrievePaymentRequest (token) {
  return baseClient.get({
    headers,
    baseUrl,
    url: `/tokens/${token}/charge`,
    service: service,
    description: `retrieve a payment request by its one-time token`
  }).then(paymentRequest => new PaymentRequest(paymentRequest))
}

function deleteToken (token) {
  return baseClient.delete({
    headers,
    baseUrl,
    url: `/tokens/${token}`,
    service: service,
    description: `delete a one-time token`
  })
}
