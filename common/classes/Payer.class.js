'use strict'

class Payer {
  constructor (opts) {
    this.externalId = opts.payer_external_id
    this.accountHolderName = opts.account_holder_name
    this.sortCode = opts.sort_code
    this.accountNumber = opts.account_number
    this.requiresAuthorisation = opts.requires_authorisation
    this.country = opts.country_code
    this.addressLine1 = opts.address_line1
    this.addressLine2 = opts.address_line2
    this.city = opts.city
    this.postcode = opts.postcode
    this.email = opts.email
  }
}

module.exports = Payer
