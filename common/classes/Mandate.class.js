'use strict'
const Payer = require('./Payer.class')
const Transaction = require('./Transaction.class')

class Mandate {
  constructor (opts) {
    this.externalId = opts.external_id
    this.returnUrl = opts.return_url
    this.gatewayAccountId = opts.gateway_account_id
    this.gatewayAccountExternalId = opts.gateway_account_external_id
    this.transactionExternalId = opts.transaction_external_id
    this.payer = opts.payer ? new Payer(opts.payer) : null
    this.transaction = opts.transaction ? new Transaction(opts.transaction) : {}
    this.state = opts.state
    this.reference = opts.mandate_reference
    this.type = opts.mandate_type
  }
}

module.exports = Mandate
