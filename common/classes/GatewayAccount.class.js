'use strict'

class GatewayAccount {
  constructor (opts) {
    this.gatewayAccountId = opts.gateway_account_id
    this.gatewayAccountExternalId = opts.gateway_account_external_id
    this.paymentMethod = opts.payment_method
    this.paymentProvider = opts.payment_provider
    this.description = opts.description
    this.type = opts.type
    this.analyticsId = opts.analytics_id
  }
}

module.exports = GatewayAccount
