'use strict'
const Payer = require('./Payer.class')

class Mandate {
  constructor (opts) {
    this.externalId = opts.external_id
    this.returnUrl = opts.return_url
    this.gatewayAccountId = opts.gateway_account_id
    this.gatewayAccountExternalId = opts.gateway_account_external_id
    this.payer = opts.payer ? new Payer(opts.payer) : null
    this.state = opts.state
    this.internalState = opts.internal_state
    this.reference = opts.mandate_reference
  }
}

module.exports = Mandate
