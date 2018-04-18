'use strict'
const Payer = require('../../common/classes/Payer.class')
const PaymentRequest = require('../../common/classes/PaymentRequest.class')
// Create random values if none provided
const randomExternalId = () => Math.random().toString(36).substring(7)
const randomNumber = () => Math.round(Math.random() * 10000) + 1
const randomUrl = () => 'https://' + randomExternalId() + '.com'
// todo add pactified
module.exports = {

  validTokenExchangeResponse: (opts = {}) => {
    const data = {
      external_id: opts.external_id || randomExternalId(),
      amount: opts.amount || randomNumber(),
      description: opts.description || 'buy Silvia a coffee',
      type: opts.type || 'CHARGE',
      state: opts.state || randomNumber(),
      return_url: opts.return_url || randomUrl(),
      gateway_account_external_id: opts.gateway_account_external_id || randomExternalId(),
      gateway_account_id: opts.gateway_account_id || randomNumber()
    }
    return {
      getPlain: () => {
        return data
      }
    }
  },

  validGatewayAccountResponse: (opts = {}) => {
    const data = {
      gatewayAccountId: opts.gatewayAccountId || randomNumber(),
      gatewayAccountExternalId: opts.gatewayAccountExternalId || randomExternalId(),
      paymentMethod: opts.paymentMethod || 'DIRECT_DEBIT',
      serviceName: opts.serviceName || 'GOV.UK Direct Cake service',
      paymentProvider: opts.paymentProvider || 'SANDBOX',
      type: opts.type || 'TEST'
    }
    return {
      getPlain: () => {
        return data
      }
    }
  },

  validCreatePayerResponse: (opts = {}) => {
    const data = {
      payer_external_id: opts.payer_external_id || randomExternalId()
    }
    return {
      getPlain: () => {
        return data
      }
    }
  },

  validPayer: (opts = {}) => {
    const data = {
      payer_external_id: opts.payer_external_id || randomExternalId(),
      account_holder_name: opts.account_holder_name || 'mr. payment',
      email: opts.email || 'user@example.test',
      account_number: opts.account_number || '12345678',
      sort_code: opts.sort_code || '123456',
      requires_authorisation: opts.requires_authorisation || 'false'
    }
    return new Payer(data)
  },

  validPaymentRequest: (opts = {}) => {
    const data = {
      external_id: opts.external_id || randomExternalId(),
      return_url: opts.return_url || randomUrl(),
      gateway_account_id: 23 || opts.gateway_account_id,
      gateway_account_external_id: opts.gateway_account_external_id || randomExternalId(),
      description: opts.description || 'buy Silvia a coffee',
      amount: opts.amount || randomNumber(),
      type: opts.type || 'CHARGE',
      state: opts.state || 'NEW'
    }
    return new PaymentRequest(data)
  }

}
