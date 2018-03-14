'use strict'

class Payer {
  constructor (opts) {
    this.externalId = opts.payer_external_id
    this.accountHolderName = opts.account_holder_name
    this.sortCode = opts.sort_code
    this.accountNumber = opts.account_number
    this.requiresAuthorisation = opts.requires_authorisation
    this.email = opts.email
  }
}

module.exports = Payer
