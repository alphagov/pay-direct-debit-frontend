'use strict'
const Payer = require('../../common/classes/Payer.class')
const Mandate = require('../../common/classes/Mandate.class')
const Transaction = require('../../common/classes/Transaction.class')
const GatewayAccount = require('../../common/classes/GatewayAccount.class')
const Service = require('../../common/classes/Service.class')
// Create random values if none provided
const randomExternalId = () => Math.random().toString(36).substring(7)
const randomNumber = () => Math.round(Math.random() * 10000) + 1
const randomUrl = () => 'https://' + randomExternalId() + '.com'
// todo add pactified
module.exports = {

  validTokenExchangeResponse: (opts = {}) => {
    const data = {
      external_id: opts.external_id || randomExternalId(),
      mandate_reference: opts.mandate_reference || 'buy Silvia a coffee',
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

  validPaymentResponse: (opts = {}) => {
    const data = {
      external_id: opts.external_id || randomExternalId(),
      return_url: opts.return_url || randomUrl(),
      gateway_account_id: 23 || opts.gateway_account_id,
      gateway_account_external_id: opts.gateway_account_external_id || randomExternalId(),
      description: opts.description || 'buy Silvia a coffee',
      amount: opts.amount || randomNumber(),
      type: opts.type || 'CHARGE',
      state: opts.state || 'NEW',
      payer: opts.payer || null
    }
    return {
      getPlain: () => {
        return data
      }
    }
  },
  validOneOffMandateResponse: (opts = {}) => {
    const data = {
      external_id: opts.external_id || randomExternalId(),
      return_url: opts.return_url || randomUrl(),
      gateway_account_id: 23 || opts.gateway_account_id,
      gateway_account_external_id: opts.gateway_account_external_id || randomExternalId(),
      mandate_reference: opts.mandate_reference || 'buy Silvia a coffee',
      mandate_type: 'ONE_OFF',
      state: opts.state || 'CREATED',
      payer: opts.payer || null,
      transaction: opts.transaction || {
        external_id: randomExternalId(),
        amount: 300,
        description: 'transaction desc',
        reference: 'transaction ref',
        state: 'NEW'
      }
    }
    return {
      getPlain: () => {
        return data
      }
    }
  },
  validOnDemandMandateResponse: (opts = {}) => {
    const data = {
      external_id: opts.external_id || randomExternalId(),
      return_url: opts.return_url || randomUrl(),
      gateway_account_id: 23 || opts.gateway_account_id,
      gateway_account_external_id: opts.gateway_account_external_id || randomExternalId(),
      mandate_reference: opts.mandate_reference || 'buy Silvia a beer',
      mandate_type: 'ON_DEMAND',
      state: opts.state || 'CREATED',
      payer: opts.payer || null,
      transaction: null
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

  validTransaction: (opts = {}) => {
    const data = {
      external_id: opts.external_id || randomExternalId(),
      return_url: opts.return_url || randomUrl(),
      gateway_account_id: 23 || opts.gateway_account_id,
      gateway_account_external_id: opts.gateway_account_external_id || randomExternalId(),
      description: opts.description || 'buy Silvia a coffee',
      amount: opts.amount || randomNumber(),
      state: opts.state || 'NEW',
      payer: opts.payer || null
    }
    return new Transaction(data)
  },
  validMandate: (opts = {}) => {
    const data = {
      external_id: opts.external_id || randomExternalId(),
      return_url: opts.return_url || randomUrl(),
      gateway_account_id: 23 || opts.gateway_account_id,
      gateway_account_external_id: opts.gateway_account_external_id || randomExternalId(),
      mandate_reference: opts.mandate_reference || 'buy Silvia a coffee',
      state: opts.state || 'CREATED',
      type: opts.type || 'ONE_OFF',
      payer: opts.payer || null,
      transaction: opts.transaction || null
    }
    return new Mandate(data)
  },
  validGatewayAccount: (opts = {}) => {
    const data = {
      gateway_account_id: opts.gateway_account_id || randomExternalId(),
      gateway_account_external_id: opts.gateway_account_external_id || randomExternalId(),
      payment_method: opts.payment_method || 'DIRECT_DEBIT',
      service_name: opts.service_name || 'GOV.UK Direct Cake service',
      payment_provider: opts.payment_provider || 'SANDBOX',
      description: opts.description || 'Gateway account description',
      type: opts.type || 'TEST',
      analytics_id: opts.analytics_id || randomExternalId()
    }

    return new GatewayAccount(data)
  },

  validService: (opts = {}) => {
    const data = {
      external_id: opts.external_id || randomExternalId(),
      name: opts.name || 'GOV.UK Direct Cake service',
      gateway_account_ids: opts.gateway_account_ids || [randomExternalId()],
      merchant_details: opts.merchant_details || {
        name: 'Silvia needs coffee',
        address_line1: 'Anywhere',
        address_line2: 'Anyhow',
        address_city: 'London',
        address_postcode: 'AW1H 9UX',
        address_country: 'GB',
        phone_number: '28398203',
        email: 'bla@bla.test'
      }
    }

    return new Service(data)
  }
}
